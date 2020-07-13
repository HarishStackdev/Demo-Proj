import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { Registration } from '../../model/registration';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']

})
export class RegistrationComponent implements OnInit {

  fg: FormGroup;
  userData: any;
  submitted = false;
  day = [];
  month = [];
  year = [];
  registration: Registration = new Registration();
  status: any = '';
  constructor(private fb: FormBuilder) {

  }

  ngOnInit() {
    this.status = 'Vamsi';

    this.buildForm();
    for (let i = 1; i <= 31; i++) {
      this.day.push(i);
    }
    for (let i = 1; i <= 12; i++) {
      this.month.push(i);
    }
  }

  Register(event) {
    this.submitted=true;
   if(!this.fg.valid){
this.fg.markAsDirty();
   }
  }

  buildForm() {
    this.fg = this.fb.group({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', Validators.required),
      userName: new FormControl('', Validators.required),
      passWord: new FormControl('', Validators.compose([Validators.required])),
      cpassWord: new FormControl('', Validators.compose([Validators.required])),
      email: new FormControl('', Validators.compose([Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')])),
      phone: new FormControl('', Validators.compose([Validators.required, Validators.pattern('^[0-9]{3}-[0-9]{3}-[0-9]{4}$')])),
      country:new FormControl('', [Validators.required]),
      postalCode:new FormControl('', [Validators.required]),
      month:new FormControl('', [Validators.required])
    });
  }
}
