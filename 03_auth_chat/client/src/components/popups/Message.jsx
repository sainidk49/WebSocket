import React from 'react'

const Message = ({ message, setIsError }) => {

  const capitalise = (str) => {
    const words = str.split(" ");
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(' ')
  }

  const handleClose = () => {
    setIsError('');
  }

  return (
    <div className='relative w-full h-full blur-layer flex justify-center items-center'>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-8/12 max-w-sm rounded-xl p-5'>
        <p className='text-sm text-gray-700 mb-4'>{capitalise(message)}</p>
        <button onClick={handleClose} className=' text-sm w-8/12 p-2 bg-blue-500 text-white hover:bg-blue-600 focus:outline-none rounded-lg'>
          Close
        </button>
      </div>
    </div>
  );
}

export default Message
