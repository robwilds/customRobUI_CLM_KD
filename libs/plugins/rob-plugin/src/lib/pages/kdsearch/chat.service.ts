/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';
export class Message {
  constructor(public author: string, public content: string) {}
}

@Injectable()
export class ChatService {
  audioFile = new Audio(
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/success.mp3'
  );

  clientId = 'sc-9a2fc58d-6ec7-4e0b-9a96-8d79b1623b82';
  clientSecret = 'hyx_cs_1n1ytJvThSUwZSd7CF6QUMKRForvRVI4gGD9ZfXAIPZNZYIoG8';
  authUrl = 'https://auth.iam.experience.hyland.com/idp/connect/token';
  hxpenvironment = 'hxai-84fe439b-e9a0-44d0-84da-07235736707e;';
  hxpapp = 'hxai-discovery';
  token: any;
  samplequestion = `{
    "question": "Find me only one good fitting job description for this applicant: The applicant holds both a Bachelor’s and Master’s degree in Chemical Engineering. With extensive experience in research, development, and project management, they excel at solving complex engineering challenges and driving innovation. Their expertise includes process optimization, chemical safety, and sustainability, with a focus on reducing environmental impact and improving energy efficiency. They work well in cross-functional teams, demonstrating strong communication skills and the ability to deliver results under pressure. Proficient in various engineering software, they are committed to sustainable practices and continuous professional development in chemical engineering",
    "contextObjectIds": [
        "518a5eda-67ba-43ed-9b5d-6b5641e37b9f"
    ]`;

  constructor(private http: HttpClient) {
    this.fetchToken();
    //this.getHATaskData();
  }

  //for pulling info from KD
  // Method to fetch token from OAuth2 server
  fetchToken() {
    console.log('<><><> fetchToken <><><>');

    let request =
      `grant_type=client_credentials&client_id=` +
      this.clientId +
      `&client_secret=` +
      this.clientSecret;

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    this.http
      .post<any>(this.authUrl, request, { headers })
      .pipe(map((response) => (this.token = response.access_token)))
      .subscribe((response) => {
        this.token = response;
        console.log('response from fetchToken is: ' + this.token);
        this.getHATaskData(this.token);
      });
  }

  getHATaskData(tok: any) {
    console.log('<><><> getHATaskData <><><>');
    console.log("here's the token from pervious process: " + tok);
    const myHeader = new HttpHeaders();
    myHeader.append('Authorization', 'Bearer ' + tok);
    myHeader.append('Hxp-Environment', this.hxpenvironment);
    myHeader.append('Hxp-App', this.hxpapp);
    let myOptions = { headers: myHeader };

    console.log('the header is: ' + myHeader.getAll('Authorization,Hxp-App'));
    // var hostName = this.appConfValues['HOST_NAME'];
    // var projectName = this.appConfValues['PROJECT_NAME'];
    // var queryUrl = hostName+"/"+projectName+"/"+this.appConfValues['ALL_TASKS_API'];

    var queryUrl =
      'https://dev-e2dffcde34734520a202dd2a2c2b23e5.insight.ncp.hyland.com/v1/metadata-schemas';

    this.http.get(queryUrl, myOptions).subscribe((res: any) => {
      //console.log(res['list']['entries'].length);
      console.log('inside get request');
      console.log(res);
    });

    /* return this.http
      .get(queryUrl, myOptions)
      .pipe(map((res: any) => res['list']['entries'])); */
    // .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  }
  conversation = new Subject<Message[]>();

  messageMap = {
    Hi: 'Hello',
    'Who are you': 'My name is Angular Bot',
    'What is Angular': 'Angular is the best framework ever',
    'Who is Brendon Gilbert': "He is the man and don't you forget it",
    'Who is Justin Carlson': 'He knows angular very well',
    default: "I can't understand. Can you please repeat",
  };

  getBotAnswer(msg: string) {
    const userMessage = new Message('user', msg);
    this.conversation.next([userMessage]);
    const botMessage = new Message('bot', this.getBotMessage(msg));

    setTimeout(() => {
      this.playFile('nothing yet');
      this.conversation.next([botMessage]);
    }, 1500);
  }

  playFile(sound: string) {
    this.audioFile.play();
  }

  playAudio() {
    this.playFile('https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/success.mp3');
  }

  getBotMessage(question: string) {
    let answer = this.messageMap[question];
    return answer || this.messageMap['default'];
  }
}
