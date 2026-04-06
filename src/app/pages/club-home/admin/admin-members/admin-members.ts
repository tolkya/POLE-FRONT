import { Component, input } from '@angular/core';

@Component({
  selector: 'app-admin-members',
  imports: [],
  templateUrl: './admin-members.html',
  styleUrl: './admin-members.scss',
})
export class AdminMembers {
  readonly clubId = input.required<number>();
}
