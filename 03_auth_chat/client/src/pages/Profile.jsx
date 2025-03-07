import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import axios from 'axios';

const Profile = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("senderId")
    const { baseUrl } = useAuth()
    const [user, setUser] = useState(null)
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.post(`${baseUrl}/api/user/profile/${userId}`)
                if (res.data.status) {
                    setUser(res.data.user)
                }
            } catch (error) {

            }
        }
        fetchUser()

    }, [userId, baseUrl])

    const handleProfile = useCallback((profileImage) => {
        navigate('/profile-image', { state: { profileImage } })
    }, [navigate])

    return (
        <div className='blur-layer relative w-full h-full bg-cover bg-center text-white px-5'>
            <div className="w-full flex gap-x-4 py-2 items-center border-b-1 border-b-gray-500">
                <div className="" onClick={() => navigate('/')}>
                    <img src="/assets/images/back.png" className='w-4' alt="" />
                </div>
                Profile
            </div>

            <div className="relative profile-picture w-4/12 mx-auto my-5 rounded-full border-1 border-gray-500">
                <img onClick={() => handleProfile(user?.profile)}
                    className='rounded-full'
                    src={user?.profile || '/assets/images/user-icon.jpg'}
                    alt="" />
                <img className='absolute z-10 bg-blue-900 bottom-0 right-0 p-1.5 w-8 rounded-md' src="/assets/images/edit.png" alt="" />
            </div>

            <div className="relative w-full text-left mt-15">
                <div className="mb-5 flex gap-x-3">
                    <img src="assets/images/user-profile.png" className='opacity-60 h-5' alt="" />
                    <p className='text-gray-200 text-sm'>{user?.name}</p>
                </div>

                <div className="mb-5 flex gap-x-3">
                    <img src="assets/images/about.png" className='opacity-60 h-5' alt="" />
                    <p className='text-gray-200 text-sm'>{user?.description}</p>
                </div>

                <div className="mb-5 flex gap-x-3">
                    <img src="assets/images/email.png" className='opacity-60 h-5' alt="" />
                    <p className='text-gray-200 text-sm'>{user?.email}</p>
                </div>

            </div>

        </div>
    )
}

export default Profile