import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { User, UserPayload } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzSpinModule,
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly message = inject(NzMessageService);

  readonly editingId = signal<number | null>(null);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly isEdit = computed(() => this.editingId() !== null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    website: [''],
    address: this.fb.nonNullable.group({
      street: [''],
      suite: [''],
      city: [''],
      zipcode: [''],
    }),
    company: this.fb.nonNullable.group({
      name: [''],
      catchPhrase: [''],
      bs: [''],
    }),
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam === null) {
      return;
    }
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      this.message.error('Некорректный идентификатор пользователя.');
      this.router.navigate(['/users']);
      return;
    }
    this.editingId.set(id);
    this.loading.set(true);
    this.userService.getUser(id).subscribe({
      next: (user) => this.patchForm(user),
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.message.error('Не удалось загрузить пользователя.');
        this.router.navigate(['/users']);
      },
    });
  }

  private patchForm(user: User): void {
    this.form.patchValue({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone ?? '',
      website: user.website ?? '',
      address: {
        street: user.address?.street ?? '',
        suite: user.address?.suite ?? '',
        city: user.address?.city ?? '',
        zipcode: user.address?.zipcode ?? '',
      },
      company: {
        name: user.company?.name ?? '',
        catchPhrase: user.company?.catchPhrase ?? '',
        bs: user.company?.bs ?? '',
      },
    });
    this.loading.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach((ctrl) => {
        ctrl.markAsDirty();
        ctrl.updateValueAndValidity({ onlySelf: true });
      });
      this.form.markAllAsTouched();
      this.message.warning('Исправьте ошибки в выделенных полях.');
      return;
    }

    const value = this.form.getRawValue();
    const payload: UserPayload = {
      name: value.name.trim(),
      username: value.username.trim(),
      email: value.email.trim(),
      phone: value.phone.trim() || undefined,
      website: value.website.trim() || undefined,
      address: {
        street: value.address.street.trim(),
        suite: value.address.suite.trim(),
        city: value.address.city.trim(),
        zipcode: value.address.zipcode.trim(),
        geo: { lat: '', lng: '' },
      },
      company: {
        name: value.company.name.trim(),
        catchPhrase: value.company.catchPhrase.trim(),
        bs: value.company.bs.trim(),
      },
    };

    this.submitting.set(true);
    const editId = this.editingId();
    const request$ =
      editId !== null
        ? this.userService.updateUser(editId, payload)
        : this.userService.createUser(payload);

    request$.subscribe({
      next: (saved) => {
        this.submitting.set(false);
        this.message.success(editId !== null ? 'Пользователь обновлён.' : 'Пользователь создан.');
        const targetId = editId ?? saved.id;
        this.router.navigate(['/users', targetId]);
      },
      error: (err) => {
        console.error(err);
        this.submitting.set(false);
        this.message.error(
          editId !== null
            ? 'Не удалось обновить пользователя.'
            : 'Не удалось создать пользователя.'
        );
      },
    });
  }

  cancel(): void {
    const editId = this.editingId();
    if (editId !== null) {
      this.router.navigate(['/users', editId]);
    } else {
      this.router.navigate(['/users']);
    }
  }
}
