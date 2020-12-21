import { AfterViewChecked, AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatTabGroup } from "@angular/material/tabs";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { mimeType } from "./mime-type.validator";

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})



export class PostCreateComponent implements OnInit{
  enteredTitle =''; // Holds the input title
  enteredContent=''; // Holds the entered content
  post: Post; // Post object to be created
  isLoading = false;
  form: FormGroup; // Form controls
  imagePreview: string; // Want to be able to see the image after selecting the file. (QoL Feature)
  tabGroup: MatTabGroup;
  index = 0;

  private mode = 'create'; // For reuse of the 'create' component as an 'edit' component as well.
  private postId: string; // Id used to pull a post from the server and edit it.

  @ViewChild('filterTabGroup', {static:false}) filterTabGroup: MatTabGroup; // For accessing the tabgroup element applying our filters

  // Constructor wtih Dependancy Injection to declare & init our PostService & ActivedRoute modules/objects (still don't know what to call them. ViewModel? Activity?).
  constructor(public postsService: PostsService, public route: ActivatedRoute) {}

    // This is a method defined in the OnInIt interface, and will run whenever this component is used (Instantiated? Although it doesn't feel like the right word).
    // It first creates a FormGroup where it defines different controls for the fields of out form, primarily validators.
    // It then subscribes to the active route. What this allows us to do is retrieves variables pertaining to Angular Routing. This is used to discern 'edit' or 'create' intentions.
    // If we are editing, we need to request the most recent copy of the post's data from the sever.
    ngOnInit() {
      // Form Setup
      this.form = new FormGroup({
        title: new FormControl(null, {validators: [Validators.required, Validators.minLength(1)], updateOn: "blur"}),
        content: new FormControl(null,{validators: []}),
        image: new FormControl(null, {
          validators: [Validators.required],
          asyncValidators: [mimeType]} )
      });
      // Subscribe to ActivedRoute parameters
      this.route.paramMap.subscribe((paramMap: ParamMap) => { // Built in observable, don't need to unsubscribe.
        if(paramMap.has('postId')) { // Created posts do not have Id's yet, as they are assigned on the server. Thus, an existing Id implies the user intends to edit.
          this.mode = 'edit'
          this.postId = paramMap.get('postId');
          this.isLoading = true; // Start Loading animation as async request is sent.
          this.postsService.getPost(this.postId).subscribe(postData =>{ // Since we need to get this data through an async call, we subscribe to the returned value of getPost(), updating our post value when it is received.
            this.isLoading = false; // Response received, stop anim
            this.post = {id: postData._id, title: postData.title, content: postData.content, imagePath: postData.imagePath, filters: postData.filters}
            console.log(this.post);
            this.form.setValue({title: this.post.title, content: this.post.content, image: this.post.imagePath}); // Set values to retrieved data if we are EDITing a post.
            this.imagePreview = this.post.imagePath; // If we are editing, set the preview to the current post's imagePath field to display
            console.log(this.post.imagePath);
            switch(this.post.filters){
              case "filter_greyscale":
                this.index = 1;
                break;
              case "filter_hue_flip":
                this.index = 2;
                break;
              case "filter_sepia":
                this.index = 3;
                break;
              case "filter_saturate":
                this.index = 4;
                break;
              default:
                this.index = 0;
                break;
            }
            console.log(this.index);
          });
        } else { // If not editing, there is no need to fetch and render form fields.
          this.mode = 'create';
          this.postId = null;
        }

      });
    }


    // This function triggers in response to a 'change' event, emiited by our faux 'Pick Image' button(s).
    // The function uses the event parameeters to retrieve the chosen file,
    onImagePicked(event: Event) {
      const file = (event.target as HTMLInputElement).files[0];
      this.form.patchValue({image: file}); // Update the value of 'image' in the FormGroup to the chosen file
      this.form.get('image').updateValueAndValidity(); // get image and recalculate value and validation of the control
      const reader = new FileReader();
      reader.onload = () => { // Assign function callback due to async.  When done loading, execute function
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }

  onSavePost() {
    let filterClass = "";
    switch(this.filterTabGroup.selectedIndex){
      case 0: // Default
        break;
      case 1: // Greyscale
        filterClass += "filter_greyscale"
        break;
      case 2: // Hue Flip
        filterClass += "filter_hue_flip"
        break;
      case 3: // Sepia
        filterClass += "filter_sepia"
        break;
      case 4: // Saturate
        filterClass += "filter_saturate"
        break;
    }
    if (this.form.invalid){
      console.log("form invalid");
      return
    }
    this.isLoading = true;
    if (this.mode === 'create'){ // For creating
      console.log(this.form.value.title);
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image, filterClass);
    }
    else{ // For updating
      this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image, filterClass);
    }
    this.form.reset() // Reset the form
  }
}
