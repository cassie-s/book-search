import React from 'react';
import { Container, Row, Card, Button, Col } from 'react-bootstrap';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import SeeMore from '../components/SeeMore';

const SavedBooks = () => {
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);

  const { loading, data } = useQuery(GET_ME);
  const userData = data?.me || {};
  const savedBooks = userData.savedBooks || [];

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      // eslint-disable-next-line
      const { data } = await removeBook({
        variables: { bookId }
      });

      if (error) {
        throw new Error('something went wrong!');
      }

      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <Container fluid className='text-light bg-dark jumbotron'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Container>
      <Container>
        <h2>
          {savedBooks.length
            ? `Viewing ${savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {savedBooks.map((book) => {
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
                  </Card.Text>                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;