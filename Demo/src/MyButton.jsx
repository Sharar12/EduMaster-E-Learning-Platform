// src/MyButton.jsx
import React from 'react'

// src/MyButton.jsx
const MyButton = (props) => {
  return (
    <button style={{ marginLeft: '5px',  padding: '10px' }}>
      {props.text}
    </button>
  )
}



export default MyButton