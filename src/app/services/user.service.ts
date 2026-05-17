import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, switchMap, take, tap } from 'rxjs';

import { User, UserPayload } from '../models/user.model';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  private readonly users$ = new BehaviorSubject<User[] | null>(null);
  private readonly localIds = new Set<number>();
  private loaded = false;

  getUsers(): Observable<User[]> {
    if (this.loaded) {
      return this.users$.asObservable() as Observable<User[]>;
    }
    return this.http.get<User[]>(API_URL).pipe(
      tap((list) => {
        this.users$.next(list);
        this.loaded = true;
      })
    );
  }

  getUser(id: number): Observable<User> {
    return this.ensureLoaded().pipe(
      switchMap((list) => {
        const cached = list.find((u) => u.id === id);
        if (cached) {
          return of(cached);
        }
        return this.http.get<User>(`${API_URL}/${id}`);
      })
    );
  }

  createUser(payload: UserPayload): Observable<User> {
    return this.http.post<User>(API_URL, payload).pipe(
      switchMap(() => this.ensureLoaded()),
      map((list) => {
        const maxId = list.reduce((acc, u) => (u.id > acc ? u.id : acc), 0);
        const id = maxId + 1;
        const localUser: User = { ...payload, id };
        this.localIds.add(id);
        this.users$.next([...list, localUser]);
        return localUser;
      })
    );
  }

  updateUser(id: number, payload: UserPayload): Observable<User> {
    const applyLocal = (): User => {
      const merged: User = { ...payload, id };
      const list = this.users$.value ?? [];
      const next = list.some((u) => u.id === id)
        ? list.map((u) => (u.id === id ? merged : u))
        : [...list, merged];
      this.users$.next(next);
      return merged;
    };

    if (this.localIds.has(id)) {
      return this.ensureLoaded().pipe(map(() => applyLocal()));
    }

    return this.http.put<User>(`${API_URL}/${id}`, { ...payload, id }).pipe(
      switchMap(() => this.ensureLoaded()),
      map(() => applyLocal())
    );
  }

  deleteUser(id: number): Observable<void> {
    const applyLocal = (): void => {
      const list = this.users$.value ?? [];
      this.users$.next(list.filter((u) => u.id !== id));
      this.localIds.delete(id);
    };

    if (this.localIds.has(id)) {
      return of(undefined).pipe(map(() => applyLocal()));
    }

    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      switchMap(() => this.ensureLoaded()),
      map(() => applyLocal())
    );
  }

  private ensureLoaded(): Observable<User[]> {
    if (this.loaded) {
      return of(this.users$.value ?? []);
    }
    return this.getUsers().pipe(take(1));
  }
}
