import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ChatService } from 'src/services/chat/chat.service';
import { WebRtcService } from 'src/services/webrtc.service';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [WebRtcService, ChatService],
  bootstrap: [AppComponent],
})
export class AppModule {}
