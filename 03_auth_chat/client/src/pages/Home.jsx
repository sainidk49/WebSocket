import React from 'react'
import { useNavigate } from 'react-router-dom'
const Home = () => {
  const navigate = useNavigate()
  return (
    <div className="blur-layer relative w-full h-full bg-cover bg-center text-white px-5">
      <div className="chat-list w-full py-5">
        <div className="chat-list-item w-full flex gap-x-4 pb-3 mb-5">
          <div className="user-img w-6 rounded-full overflow-hidden">
            <img src="/assets/images/user-icon.jpg" alt="" />
          </div>
          <p className='text-md capitalize'>
            ajay
          </p>
          <div className="user-img ml-auto w-6 h-6 rounded-full overflow-hidden bg-white text-green-500 text-md flex items-center justify-center">
            <p>2</p>
          </div>
        </div>
        <div className="chat-list-item w-full flex gap-x-4 pb-3">
          <div className="user-img w-6 rounded-full overflow-hidden">
            <img src="/assets/images/user-icon.jpg" alt="" />
          </div>
          <p className='text-md capitalize'>
            ajay
          </p>
          <div className="user-img ml-auto w-6 h-6 rounded-full overflow-hidden bg-white text-green-500 text-md flex items-center justify-center">
            <p>2</p>
          </div>
        </div>
      </div>
      <div className="add-user absolute right-2.5 bottom-2.5">
        <button onClick={() => navigate('/users')} className="bg-linear-to-r from-blue-500 to-cyan-500 text-white text-1xl py-2 px-5 rounded-xl">Add User</button>
      </div>
    </div>
  )
}

export default Home