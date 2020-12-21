import { AbstractControl } from "@angular/forms";
import { observable, Observable, Observer, of } from "rxjs";

// Will be an async validator
// Returning null means it's valid, error if not
// Async validators are wrapped in either a promise or an observable
export const mimeType = (control: AbstractControl): Promise<{[key: string]: any}> | Observable<{[key: string]: any}> => { // Notation doesn't indicate name of property, just property itself
  if (typeof(control.value) === 'string') { // Return null (AKA valid) if the type is a string. This allows us to edit posts with images where we arent editting the actual image (i.e. just the title or content)
    return of(null); // 'of' is a rxjs observable that immediately emits a variable amount of values in a sequence and then emits a 'complete' notification
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  const frObs = Observable.create(
    (observer: Observer<{ [key: string]: any}>) => { // Creating an observable
    fileReader.addEventListener("loadend", () => { // Set an onloadend  event listener
      // Using Byte Array to check the patterns of the file. This is how we infer type
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
      let header = "";
      let isValid = false;
      for (let i =0; i < arr.length; i++) {
        header += arr[i].toString(16); // 16 to convert to hexidecimal
      }
      // Looked up file signatures of common image formats as filter
      switch (header) {
        case "89504e47":
          isValid = true;
          break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
          isValid = true;
          break;
        default:
          isValid = false;
          break;
      }
      if (isValid) {
        observer.next(null); // Emit null (valid)
      } else {
        observer.next({invalidType: true}); // Or emit an error object (invalid)
      }
      observer.complete();
    });
    fileReader.readAsArrayBuffer(file); // This will trigger our fileReader event listener on load-end
    }
  );
  return frObs; // Sync code returns observable that will update observer when complete
}
