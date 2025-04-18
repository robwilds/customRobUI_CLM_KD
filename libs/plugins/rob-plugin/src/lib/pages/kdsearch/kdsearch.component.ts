import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Message, ChatService } from './chat.service';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
@Component({
  templateUrl: './kdsearch.component.html',
  selector: 'rob-plugin-kdsearch',
  imports: [
    TranslateModule,
    MatFormField,
    MatLabel,
    MatIcon,
    CommonModule,
    FormsModule,
    MatInputModule,
  ],
  styleUrl: './kdsearch.component.scss',
  standalone: true,
  providers: [ChatService],
})
export class KdsearchComponent {
  messages: Message[] = [];
  value: string | undefined;

  constructor(public chatService: ChatService) {}

  ngOnInit() {
    this.chatService.conversation.subscribe((val) => {
      this.messages = this.messages.concat(val);
    });
  }

  sendMessage() {
    this.chatService.getBotAnswer(this.value);
    this.value = '';
  }
}
