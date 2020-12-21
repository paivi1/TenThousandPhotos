import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Post } from '../post.model'
import { PostsService } from "../posts.service";
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {
  // hardCodedPosts = [
  //   { title: 'Post 1', content: 'Content 1'},
  //   { title: 'Post 2', content: 'Content 2'},
  //   { title: 'Post 3', content: 'Content 3'}
  // ];

  posts: Post[] = []; // Local copy of the posts array
  isLoading = false; // For anims

  private postsSub: Subscription; // Subscription to the PostUpdatedListener enabling us to re-render new data when the model changes

  // Constructor wtih Dependancy Injection to declare & init a postService property
  constructor(public postsService: PostsService) {}

  // Method called by our post's Delete button. Passes ID of post to be deleted on to the delete method of post.service
  onDelete(postId: string){
    this.postsService.deletePost(postId);
  }

  // Called on initiation. Calls posts.service to retrieve freshest data and subscribes to the listener in order to be notified of changes.
  // Also sets loading anim while we wait for data
  ngOnInit() {
    this.isLoading = true;

    this.postsService.getPosts();
    this.postsSub = this.postsService.getPostUpdatedListener()
    .subscribe((posts: Post[]) => {
      this.isLoading = false;
      this.posts = posts;
      console.log(posts)
    }); // Subscribes to emmitted events from our PostsService instance
  }

  // Since this is a custom component we subscribe from and not built into Angular, we need to make sure we unsubscribe when the component is torn down.
  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

}
