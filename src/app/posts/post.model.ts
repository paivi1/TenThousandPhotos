
// Our post model object
export interface Post {
  id: string; // Id will be needed to reference each post with a unique identifier
  title: string; // While I wont be adding much in terms of user accounts and authentication, I think a Title and content (maybe a caption?) should look nice
  content: string;
  imagePath: string; // From what I've learned, it seems that saving the image file on the server and only storing the image path is the best use of space. (Especially with only a MongoDB free trial)
  filters: string; // Holds a bunch of strings representing classes to be rendered with a specified filter
}
