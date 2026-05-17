import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, of, switchMap, take, tap } from 'rxjs';

import { User, UserPayload } from '../models/user.model';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);

  private readonly users$ = new BehaviorSubject<User[] | null>(null);
  private loaded = false;
  private nextLocalId = 1000;

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
    if (this.loaded) {
      const cached = (this.users$.value ?? []).find((u) => u.id === id);
      if (cached) {
        return of(cached);
      }
    }
    return this.http.get<User>(`${API_URL}/${id}`);
  }

  createUser(payload: UserPayload): Observable<User> {
    return this.http.post<User>(API_URL, payload).pipe(
      switchMap(() => this.ensureLoaded()),
      map(() => {
        const localUser: User = { ...payload, id: ++this.nextLocalId };
        this.users$.next([localUser, ...(this.users$.value ?? [])]);
        return localUser;
      })
    );
  }

  updateUser(id: number, payload: UserPayload): Observable<User> {
    return this.http.put<User>(`${API_URL}/${id}`, { ...payload, id }).pipe(
      switchMap(() => this.ensureLoaded()),
      map(() => {
        const merged: User = { ...payload, id };
        const list = this.users$.value ?? [];
        const next = list.some((u) => u.id === id)
          ? list.map((u) => (u.id === id ? merged : u))
          : [merged, ...list];
        this.users$.next(next);
        return merged;
      })
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      switchMap(() => this.ensureLoaded()),
      map(() => {
        const list = this.users$.value ?? [];
        this.users$.next(list.filter((u) => u.id !== id));
        return undefined;
      })
    );
  }

  private ensureLoaded(): Observable<User[]> {
    if (this.loaded) {
      return of(this.users$.value ?? []);
    }
    return this.getUsers().pipe(take(1));
  }
}
