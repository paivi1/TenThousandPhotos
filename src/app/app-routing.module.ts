import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { PostListComponent } from './posts/post-list/post-list.component';

// This can all be done in the app.module.ts file, but instead we configure routing here and export it as it's own module
// Thus, only needing to add that AppRoutingModule to app.module.ts

const routes: Routes = [
  { path: '', component: PostListComponent }, // Default page displays the list of posts
  { path: 'create', component: PostCreateComponent },
  { path: 'edit/:postId', component: PostCreateComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Makes the module aware of the routes defined above
  exports: [RouterModule] // Export configured router module
})
export class AppRoutingModule { }
