import { Component } from '@angular/core';
import { LoginService } from './login.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';

  constructor(
  	private login:LoginService,
  	private router:Router
  	){}

  isLoggedIn: boolean
  logged_user:string
  username_exists:boolean
  email_exists:boolean
  incorrect:boolean

  ngOnInit(){
  	let localuser = localStorage.getItem('username')
  	if(localuser != null){
  		this.isLoggedIn = true
  		this.logged_user = localuser
  	}else{
  		this.isLoggedIn = false
  	}
  }

  onSubmit(e){
  	e.preventDefault();
  	let target = e.target
  	let username = target.username.value
  	let password = target.password.value
  	if(username && password){
  		let login_auth = {
  			username:username,
  			password:password
  		}
  		this.login.login(login_auth).subscribe(data => {
  			if(data.status == true){
  				localStorage.setItem('username',data.data)
  				window.location.reload()
  			}else{
  				this.incorrect = true
  			}
  		})
  	}
  }

  onRegister(e){
  	e.preventDefault()
  	let target = e.target
  	let username = target.susername.value
  	let email = target.semail.value
  	let password = target.spassword.value
  	console.log(password)
  	if(username && email && password){
  		let register_auth = {
  			username:username,
  			email:email,
  			password:password
  		}
  		this.login.register(register_auth).subscribe(data => {
  			if(data.status == true){
  				window.location.reload()
  			}else{
  				if(data.username_exists == true){
  					this.username_exists = true
  					this.email_exists = false
  				}else if(data.email_exists == true){
  					this.email_exists = true
  					this.username_exists = false
  				}else{
  					this.username_exists = false
  					this.email_exists = false
  				}
  			}
  		})
  	}
  }

  logout(){
  	localStorage.removeItem('username')
  	window.location.reload()
  }

}
