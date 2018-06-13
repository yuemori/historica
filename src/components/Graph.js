import React from 'react';

const dotStrokeWidth = 5;
const contentHeight = 30;

const Node = (props) => {
  const {x, y} = props;
  const cx = 15 + x * 15;
  const cy = 15 + contentHeight * y;

  return <circle cx={cx} cy={cy} r={dotStrokeWidth} />;
}

const Row = (props) => {
  const {row} = props;

  return (
    <g>
      {row.columns.map((column, x) => {
        if(column.id === row.commit.id) {
          return <Node key={x} x={x} y={props.y} />
        }

        return null;
      })}
    </g>
  )
}
const Graph = (props) => {
  const maxY = props.rows.length * contentHeight;

  return (
    <svg height={maxY}>
    {props.rows.map((row, y) => {
      return <Row key={y} y={y} row={row} />
    })}
    </svg>
  )
}

export default Graph;
