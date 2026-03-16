import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificationReceipt } from '../../notification-receipts.service';

@Component({
  selector: 'app-notification-list',
  imports: [DatePipe],
  templateUrl: './notification-list.html',
  styleUrl: './notification-list.scss',
})
export class NotificationList {
  readonly receipts = input.required<NotificationReceipt[]>();
  readonly markAsRead = output<number>();

  onMarkAsRead(id: number): void {
    this.markAsRead.emit(id);
  }

  buildMessage(receipt: NotificationReceipt): string {
    const ctx = receipt.event.context;
    switch (receipt.event.notifType) {
      case 'CLUB_CREATED':
        return `Nouveau club créé : ${ctx?.['clubName'] ?? ''} par ${ctx?.['adminFirstName'] ?? ''} ${ctx?.['adminLastName'] ?? ''}`;
      default:
        return receipt.event.notifType;
    }
  }
}