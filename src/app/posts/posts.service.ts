import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Post } from './post.model';
import { Subject } from 'rxjs'
import { map } from 'rxjs/operators'
import { Router } from '@angular/router';

@Injectable({providedIn: 'root'}) // Allows us to not have to add 'PostsService' in the app.module.ts file Provider Array. Everything in 'root' will use the same instance as well
export class PostsService {
  private posts: Post[] = []; // This is where we'll keep our array of posts for displaying in the list component

  // A post array that holds updated data whenever we pull new information. Set private to prevent other components from emmitting data with it
  private postsUpdated = new Subject<Post[]>();

  // Constructor,  will declare and instantiate variables 'http' and 'router' (loving this Dependancy Injection framework)
  constructor(private http: HttpClient, private router: Router) {}


  // This method sends a message to the API endpoint, which should return all the posts in the database and map each into a valid Post object
  getPosts() {
    this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts') // Http GET request as well as expected return value
    .pipe(map((postData) => { // RxJS Pipe() allows us to funnel the values returned through obervables into a chain of functions
      return postData.posts.map(post => { // Here we use pipe() to map the returned data to a Post array, specifically needed for the mismatched 'id' property names
        return {
          title: post.title,
          content: post.content,
          id: post._id,
          imagePath: post.imagePath,
          filters: post.filters
        };
      });
    }))
    .subscribe((transformedPosts) => { // Now that we have an array of valid posts we want to use it to update our current model of the Posts Database
      this.posts = transformedPosts; // Set this.posts to the received data's 'posts' array
      this.postsUpdated.next([...this.posts]) // Emit event to notify other components of the updated data
      // Above is syntax to create a new array and copy all elements from this.posts, and return it (JS is pass by reference)
    });
  }

  // This allows components using the posts.service to get a referenance to the 'postsUpdated' observable, allowing them to consume 'postsUpdated' events
  // This is neccessary due to the posts.service facilitating primarily async calls
  getPostUpdatedListener() {
    return this.postsUpdated.asObservable();
  }

  // Here we return an observable for the calling component to subscribe to, allowing us to make an async call for a specified post
  getPost(id: string) {
    return this.http.get<{_id: string, title: string, content: string, imagePath: string, filters: string}>("http://localhost:3000/api/posts/" + id);
  }

  // This function adds a new Post to the Database through the server API
  addPost(title: string, content: string, image: File, filters: string) {
    const postData = new FormData(); // Setup form and it's fields
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    postData.append('filters', filters)
    console.log("args: " + title);
    console.log("Pdata: " + postData.get('title'));
    this.http
      .post<{message : string, post: Post}>('http://localhost:3000/api/posts', postData) // Angular httpClient will auto-set correct headers, and detect non-json data (files) for us if they exist
      .subscribe((responseData) => {
        const post: Post = {        // Setting values as those recieved from the server, but could also use local copies from header too as they are the same !!!!!
          id: responseData.post.id, // There's two side's to this imo. Setting them from server technically allows server errors to spill out onto frontend
          title: responseData.post.title, // But there's also the argument to be made for consistency between the local and remote models whenever possible
          content: responseData.post.content, // For me, I prefer the server errors spill into frontend, where they can be quickly visualized, caught, and fixed
          imagePath: responseData.post.imagePath,
          filters: filters};
        this.posts.push(post); // Only update client if server-side post is successful and we get a response back that allows us to create that 'post'
        this.postsUpdated.next([...this.posts]); // Emit event to notify of updated dataset
        this.router.navigate(["/"]) // Use the Angular router to navigate us back to the post list page if we are successful
    })
  }

  // This function updates an existing post. Updated values are passed as arguments to this function and are formatted before sending to server
  updatePost(id: string, title: string, content: string, image: File | string, filters: string) { // The image may be either a new image (file) or unchanged (existing filepath)
    let postData: Post | FormData; // If the actual image file is changed, we must use FormData to send. Otherwise, we can use a Post object
    if(typeof(image) === 'object') { // Control flow if image is a File
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
      postData.append('filters', filters);
    } else { // Control flow if image is a string
      postData = { id: id, title: title, content: content, imagePath: image as string, filters: filters}; // Need to explicitly state it's a string in this case
    }
    this.http.put("http://localhost:3000/api/posts/" + id, postData) // PUT Request - Target API endpoint with specified 'id' with 'postData' as payload
    .subscribe(response => {
      const updatedPosts = [...this.posts]; // Get a copy of our posts array
      const oldPostIndex = updatedPosts.findIndex( p => p.id === id); // Find the index of the post we just updated
      const post: Post = { id: id, title: title, content: content, imagePath: "", filters: filters};
      // imagePath needs to be set to create a valid post, but the value is meaningless. Anytime the image is viewed, the path is pulled
      // from the server through either the user hitting 'edit' or the post-list rendering through ngOnInit(), hence the empty string value above

      updatedPosts[oldPostIndex] = post; // Change the post (found using its index) by setting it's value to our newly updated post
      this.posts = updatedPosts; // Set our posts array to the updated array
      this.postsUpdated.next([...this.posts]); // Emit an event to notify other components of the update
      this.router.navigate(["/"]) // Use the Angular router to navigate us back to the post list page if we are successful
    });
  }

  // This function Deletes a post in the database with the specified 'postId'.
  deletePost(postId: string){
    this.http.delete("http://localhost:3000/api/posts/" + postId) // DELETE Request - delete the post with '_id' == 'postId'
    .subscribe(() => {
      console.log('Deleted')
      const updatedPosts = this.posts.filter(post => post.id !== postId); // Filter out the post we just deleted from out local array
      this.posts = updatedPosts; // Update our local copy
      this.postsUpdated.next([...this.posts]); // Emit event to notify changes
    });
  }
}
