import React, { useState } from 'react';
import { Button } from 'react-bootstrap';

const SeeMore = ({ text, limit = 150 }) => {
  const [showAll, setShowAll] = useState(false);

  if (!text) return null;

  const isLong = text.length > limit;
  const displayText = showAll ? text : text.slice(0, limit);

  return (
    <span>
      {displayText}
      {isLong && !showAll && '... '}
      {isLong && (
        <Button
        variant="link"
        size="sm"
        onClick={() => setShowAll(!showAll)}
        style={{ padding: 0 }}
        >
          {showAll ? 'See less' : 'See more'}
        </Button>
      )}
    </span>
  );
};

export default SeeMore;