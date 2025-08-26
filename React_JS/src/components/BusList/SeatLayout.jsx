import React from 'react';

const SeatLayout = ({ totalSeats = 50 }) => {
  const seatsPerRow = 5;
  const rows = Math.ceil(totalSeats / seatsPerRow);
  const layout = [];

  for (let i = 0; i < rows; i++) {
    const row = [];

    // Left side (2 seats)
    for (let j = 0; j < 2; j++) {
      const seatNumber = i * seatsPerRow + j + 1;
      if (seatNumber <= totalSeats) {
        row.push(
          <div
            key={`L${seatNumber}`}
            className="w-4 h-4 bg-green-500 rounded-sm m-0.5"
          />
        );
      }
    }

    // Aisle
    row.push(<div key={`aisle${i}`} className="w-2" />);

    // Right side (3 seats)
    for (let j = 2; j < seatsPerRow; j++) {
      const seatNumber = i * seatsPerRow + j + 1;
      if (seatNumber <= totalSeats) {
        row.push(
          <div
            key={`R${seatNumber}`}
            className="w-4 h-4 bg-green-500 rounded-sm m-0.5"
          />
        );
      }
    }

    layout.push(
      <div key={`row${i}`} className="flex justify-center items-center">
        {row}
      </div>
    );
  }

  return <div className="mt-2 flex flex-col gap-1">{layout}</div>;
};

export default SeatLayout;
