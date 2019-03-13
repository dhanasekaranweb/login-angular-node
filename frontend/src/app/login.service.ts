import { Injectable } from '@angular/core';
import { Router } from '@angular/router'
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class LoginService {

	private login_url = "http://localhost:3000/api"

  constructor(
  	private router:Router,
  	private http:HttpClient
  	) { }

  login(data: any): Observable<any>{
  	return this.http.post(this.login_url + "/login",data)
  }

  register(data: any): Observable<any>{
  	return this.http.post(this.login_url + "/register",data)
  }

}
