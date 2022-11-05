import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FormService} from "../../services/form.service";
import {Application} from "../../models/application.model";
import {Router} from "@angular/router";
import {tap} from "rxjs";
import {ContactTypeEnum} from "../../enums/contact-type.enum";
import {ApplicationsService} from "../../services/applications.service";
import {SectorTypeEnum} from "../../enums/sector-type.enum";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  loading = false;

  mainForm!: FormGroup;
  contactTypeOptions!: ContactTypeEnum[];
  sectorTypeOptions!: SectorTypeEnum[];

  constructor(private formBuilder: FormBuilder,
              private formService: FormService,
              private applicationsService: ApplicationsService,
              private router: Router) { }

  ngOnInit(): void {
    this.initMainForm();
    this.initOptions();
  }

  private initMainForm(): void {
    this.mainForm = this.formBuilder.group({
      company: ['', Validators.required],
      address: ['', Validators.required],
      contactType: ['', Validators.required],
      contact: ['', Validators.required],
      message: ['', Validators.required],
      sector: ['', Validators.required],
      commentary: ['']
    });
  }

  onSubmitForm() {
    this.loading = true;
    let newApplication : Application = {
      ...this.mainForm.value,
      id: this.applicationsService.maxId+1,
      answer: 'Aucune'
    }
    this.formService.saveApplication(newApplication).pipe(
      tap(saved => {
        this.loading = false;
        if (saved) {
          this.resetForm();
        } else {
          console.log("An error as occurred during saving data")
        }
      })
    ).subscribe();
    this.router.navigateByUrl('/applications')
  }

  private resetForm(){
    this.mainForm.reset();
  }

  private initOptions() {
    this.contactTypeOptions = [
      ContactTypeEnum.LINKEDIN,
      ContactTypeEnum.EMAIL_PERSO,
      ContactTypeEnum.EMAIL_SUPPORT,
      ContactTypeEnum.FORMULAIRE_CONTACT,
      ContactTypeEnum.FORMULAIRE_CANDIDATURE_SPON,
      ContactTypeEnum.OFFRE_STAGE
    ];
    this.sectorTypeOptions = [
      SectorTypeEnum.AI,
      SectorTypeEnum.RECRUITER,
      SectorTypeEnum.B2B,
      SectorTypeEnum.SECURTY,
      SectorTypeEnum.VIDEO_GAMES
    ];
  }
}