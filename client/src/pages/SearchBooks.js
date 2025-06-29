import React, { useState, useEffect } from 'react';
import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
import Auth from '../utils/auth';
import { searchGoogleBooks } from '../utils/API';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import { useMutation } from '@apollo/react-hooks';
import { SAVE_BOOK } from '../utils/mutations';
import SeeMore from '../components/SeeMore';

const SearchBooks = () => {
  
  // create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);
  // create state for holding our search field data
  const [searchInput, setSearchInput] = useState('');
  // create state to hold saved bookId values
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  const [saveBook, { error }] = useMutation(SAVE_BOOK);

  // set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
  // learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });

  // create method to search for books and set state on form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await searchGoogleBooks(searchInput);

      if (!response.ok) {
        throw new Error('something went wrong!');
      }

      const { items } = await response.json();

      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));

      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // create function to handle saving a book to our database
  const handleSaveBook = async (bookId) => {
    // find the book in `searchedBooks` state by the matching id
    const bookInput = searchedBooks.find((book) => book.bookId === bookId);

    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      // eslint-disable-next-line
      const { data } = await saveBook({
        variables: { input: bookInput }
      });

      if (error) {
        throw new Error('something went wrong!');
      }

      // if book successfully saves to user's account, save book id to state
      setSavedBookIds([...savedBookIds, bookInput.bookId]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Container fluid className='text-light bg-dark jumbotron'>
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Form.Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg' className='mt-4'>
                  Submit Search
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </Container>

      <Container>
        <h2>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col key={book.bookId} border='dark' xs={12} sm={6} md={4} lg={3} className="mb-4">
                <Card.Img 
                  src={book.image ? book.image :'/no_image.png'}
                  alt={`The cover for ${book.title}`} 
                  variant='top' 
                />
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>
                    <SeeMore text={book.description} limit={150} />
                  </Card.Text>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds?.some((savedBookId) => savedBookId === book.bookId)}
                      className='btn-block btn-info'
                      onClick={() => handleSaveBook(book.bookId)}>
                      {savedBookIds?.some((savedBookId) => savedBookId === book.bookId)
                        ? 'This book has been saved!'
                        : 'Save this Book!'}
                    </Button>
                  )}
                </Card.Body>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;