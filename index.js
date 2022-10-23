class Book {
    constructor(name){
        this.name = name;
        this.authors = [];
    }

    // to add an author to book above
    addAuthor(name, genre){
        this.authors.push(new Author(name, genre));
    }
}

class Author {
    constructor(name, genre){
        this.name = name;
        this.genre = genre;
    }
}

class BookService {
    // static used so the url itself doesn't become an instance/object
    static url = "https://6352c555d0bca53a8eb4cd0d.mockapi.io/Promineo_Tech_API/book";

    
    
    // methods to send all CRUD (Read/GET, Create/POST, Update/PUT, DELETE) requests:

    // doesn't need parameters because it's just returning all of the books from this url
    static getAllBooks(){
        return $.get(this.url);
    }

    // to Read/GET a specific book:
    static getBook(id){
        return $.get(this.url + `/${id}`)
            ;
    }

    // to Create/POST a book:
    // book parameter = will take instance of class Book
    static createBook(book){
        return $.post(this.url, book);
        // code below was in Matthew's mock API powerpoint, but the code was working just the same for me with or without it.
        // console.log("createBook book:". book);
        // return $.ajax({
        //     url: this.url ,
        //     // + `/${book._id}`,
        //     dataType: "json",
        //     data: JSON.stringify(book),
        //     contentType: "application/json",
        //     type: "POST",
        //     crossDomain: true,
        // });
    }

    // to Update/PUT a book:
    static updateBook(book){
        // console.log("createBook book:", bookData);
        // let newBookName = bookData.bookName;
        // console.log("updateBook")
        return $.ajax({
            url: this.url + `/${book._id}`,
            dataType: "json",
            data: JSON.stringify(book),
            contentType: "application/json",
            type: "PUT",
            crossDomain: true
        });
    }

    // to DELETE a book (whatever book that corresponds with that id):
    static deleteBook(id){
        return $.ajax({
            url: this.url + `/${id}`,
            type: "DELETE",
            crossDomain: true
        });
    }
}


// will rerender the DOM everytime a new class is created
class DOMManager {
    static books;

    static getAllBooks(){
        BookService.getAllBooks().then(books => this.render(books));
    }

    // creating a new Book and then rerendering the DOM:
    static createBook(name){
        BookService.createBook(new Book(name))
        .then(() => {
            return BookService.getAllBooks();
        })
        .then((books) => this.render(books));
    }

    // if you delete a books, the DOM will be rerendered with the updated list of existing books
    // when I click on the delete button, console says: https://6352c555d0bca53a8eb4cd0d.mockapi.io/Promineo_Tech_API/book/undefined 404 (Not Found).
    static deleteBook(id){
        BookService.deleteBook(id)
            .then(() => {
                return BookService.getAllBooks();
            })
            .then((books) => this.render(books));
    }

    // when an author is added to a specific Book and info is updated, it will rerender the DOM
    // when I click on the add button, nothing happens. Throughout coding, I did receive this error quite a bit: Uncaught ReferenceError: DOMManager is not defined at HTMLButtonElement.onclick ((index):1:1).
    static addAuthor(id){
        for (let book of this.books){
            if (book._id == id){
                book.authors.push(new Author($(`#${book._id}-author-name`).val(), $(`#${book._id}-author-genre`).val()));
                BookService.updateBook(book)
                    .then(() => {
                        return BookService.getAllBooks();
                    })
                    .then((books) => this.render(books));
            }
        }
    }

    // to delete the correct author for the book and then rerenders the DOM
    static deleteAuthor(bookId, authorId){
        for (let book of this.books){
            if (book._id == bookId){
                for (let author of book.authors){
                    if (author._id == authorId){
                        book.authors.splice(book.authors.indexOf(author), 1);
                        BookService.updateBook(book)
                            .then(() => {
                                return BookService.getAllBooks();
                            })
                            .then((books) => this.render(books));
                    }
                }
            }
        }
    }
    
    static render(books){
        this.books = books;
        $("#app").empty();
        for (let book of books){
            // prepends makes each new entry be on the top; HTML below for when each book is created
            $("#app").prepend(
                // cards with each book created + Delete button, then input boxes for book info + Add button
                `<div id="${book._id}" class="card">
                    <div class="card-header">
                        <h2>${book.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteBook('${book._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${book._id}-author-name" class="form-control" placeholder="Author">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${book._id}-author-genre" class="form-control" placeholder="Genre">
                                </div>
                            </div>
                            <button id="${book._id}-new-author" onclick="DOMManager.addAuthor('${book._id}')" class="btn btn-info form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );

            
            // for each author of the specific book, use this HTML:
            // when using code below, I kept getting a jQuery error that book.authors is not iterable and it wouldn't let me add a new book.

            // for (let author of book.authors){
            //     $(`#${book._id}`).find(".card.body").append(
            //         `<p>
            //         <span id="name-${author._id}"><strong>Name: </strong> ${author.name}</span>
            //         <span id="genre-${author._id}"><strong>Genre: </strong> ${author.genre}</span>
            //         <button class="btn btn-danger" onclick="DOMManager.deleteAuthor('${book._id}'. '${author._id}')">Delete Author</button>
            //         `
            //     );
            // }
        }
    }
}

// CREATE div defined in HTML file
// click method has been deprecated but still should work.
$("#create-new-book").click(() => {
    DOMManager.createBook($("#new-book-name").val());
    $("#new-book-name").val("");
});

// another way to write function above without the deprecated click, but using this function created an error.
// $('#create-new-book').on(('click', ()=>{
//     DOMManager.createBook($("#new-book-name").val());
//     $("#new-book-name").val("");
// }));

DOMManager.getAllBooks();

// Maybe my MockAPI wasn't connected correctly to my code. I tried to add each variable used above (ie. name, id, author, genre) to the schema in the API.