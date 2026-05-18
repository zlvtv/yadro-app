import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

type SortColumn = 'id' | 'name' | 'username' | 'email' | 'company';
type SortOrder = 'ascend' | 'descend' | null;

const sortAccessor = (u: User, col: SortColumn): string | number => {
  switch (col) {
    case 'id':
      return u.id;
    case 'name':
      return u.name.toLowerCase();
    case 'username':
      return u.username.toLowerCase();
    case 'email':
      return u.email.toLowerCase();
    case 'company':
      return (u.company?.name ?? '').toLowerCase();
  }
};

@Component({
  selector: 'app-user-list',
  imports: [
    FormsModule,
    RouterLink,
    NzButtonModule,
    NzCardModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzPaginationModule,
    NzPopconfirmModule,
    NzSpinModule,
    NzTableModule,
    NzTagModule,
    NzEmptyModule,
    NzToolTipModule,
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserListComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly message = inject(NzMessageService);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly nameTerm = signal('');
  readonly emailTerm = signal('');
  readonly pageIndex = signal(1);
  readonly pageSize = signal(5);
  readonly sortColumn = signal<SortColumn | null>(null);
  readonly sortOrder = signal<SortOrder>(null);
  readonly sortDirections: SortOrder[] = ['ascend', 'descend'];

  readonly filteredUsers = computed(() => {
    const name = this.nameTerm().trim().toLowerCase();
    const email = this.emailTerm().trim().toLowerCase();
    return this.users().filter((u) => {
      const matchName = !name || u.name.toLowerCase().includes(name);
      const matchEmail = !email || u.email.toLowerCase().includes(email);
      return matchName && matchEmail;
    });
  });

  readonly sortedUsers = computed(() => {
    const col = this.sortColumn();
    const order = this.sortOrder();
    const list = this.filteredUsers();
    if (!col || !order) {
      return list;
    }
    const factor = order === 'ascend' ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = sortAccessor(a, col);
      const bv = sortAccessor(b, col);
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  });

  readonly pagedUsers = computed(() => {
    const start = (this.pageIndex() - 1) * this.pageSize();
    return this.sortedUsers().slice(start, start + this.pageSize());
  });

  readonly total = computed(() => this.filteredUsers().length);

  getSortOrder(col: SortColumn): SortOrder {
    return this.sortColumn() === col ? this.sortOrder() : null;
  }

  onSortChange(col: SortColumn, order: string | null): void {
    const next: SortOrder = order === 'ascend' || order === 'descend' ? order : null;
    if (next === null) {
      this.sortColumn.set(null);
      this.sortOrder.set(null);
    } else {
      this.sortColumn.set(col);
      this.sortOrder.set(next);
    }
    this.pageIndex.set(1);
  }

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.message.error('Не удалось загрузить пользователей.');
      },
    });
  }

  onNameChange(value: string): void {
    this.nameTerm.set(value);
    this.pageIndex.set(1);
  }

  onEmailChange(value: string): void {
    this.emailTerm.set(value);
    this.pageIndex.set(1);
  }

  resetFilters(): void {
    this.nameTerm.set('');
    this.emailTerm.set('');
    this.pageIndex.set(1);
  }

  onPageIndexChange(index: number): void {
    this.pageIndex.set(index);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
  }

  trackById(_: number, user: User): number {
    return user.id;
  }

  deleteUser(user: User): void {
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.users.set(this.users().filter((u) => u.id !== user.id));
        this.message.success(`Пользователь «${user.name}» удалён.`);
        const lastPage = Math.max(1, Math.ceil(this.total() / this.pageSize()));
        if (this.pageIndex() > lastPage) {
          this.pageIndex.set(lastPage);
        }
      },
      error: (err) => {
        console.error(err);
        this.message.error('Не удалось удалить пользователя.');
      },
    });
  }
}
