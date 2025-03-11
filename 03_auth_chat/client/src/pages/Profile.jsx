import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import axios from 'axios';
import InputPopup from '../components/popups/Input';

const Profile = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("senderId")
    const { baseUrl } = useAuth()
    const [user, setUser] = useState(null)
    const [isupdate, setUpdate] = useState(null)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.post(`${baseUrl}/api/user/profile/${userId}`)
                if (res.data.status) {
                    setUser(res.data.user)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchUser()

    }, [userId, baseUrl])

    const handleProfile = useCallback((profileImage) => {
        navigate('/profile-image', { state: { profileImage } })
    }, [navigate])


    const handleImage = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append("profile", file);

        try {
            const res = await axios.post(`${baseUrl}/api/user/profile/update/${userId}`, formData);
            if (res.data.status) {
                setUser(res.data.user)
                console.log(res.data.message)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleLogout = () => {
        localStorage.clear()
        navigate('/login')
    }

    const handleUpdate = useCallback((updateDetail) => {
        setUpdate(updateDetail)
    }, [user])



    return (
        <div className='blur-layer relative w-full h-full bg-cover bg-center text-white px-5'>
            <div className="w-full flex gap-x-4 py-2 items-center border-b-1 border-b-gray-500">
                <div className="" onClick={() => navigate('/')}>
                    <img src="/assets/images/back.png" className='w-4' alt="" />
                </div>
                Profile
            </div>

            <div className="relative profile-picture w-25 h-25 mx-auto my-5 rounded-full border-1 border-gray-500"
                style={{
                    backgroundImage: `url(${user?.profile || '/assets/images/user-icon.jpg'})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="absolute top-0 left-0 w-full h-full"
                    onClick={() => handleProfile(user?.profile)}></div>
                {/* <img 
                    className='rounded-full'
                    src={user?.profile || '/assets/images/user-icon.jpg'}
                    alt="" /> */}
                <label className='absolute z-10 bg-blue-900 bottom-0 right-0 p-1.5 w-8 rounded-md' htmlFor="pictureUpload">
                    <img src="/assets/images/edit.png" alt="" />
                </label>
                <input type="file" id='pictureUpload' className="hidden" onChange={(e) => handleImage(e.target.files[0])} />
            </div>


            <div className="relative w-full text-left mt-15">
                <div className="mb-5 flex gap-x-3 cursor-pointer max-md:cursor-auto"
                    onClick={() => handleUpdate({ name: user?.name })}>
                    <img src="assets/images/user-profile.png" className='opacity-60 h-5' alt="" />
                    <p className='text-gray-200 text-sm'>{user?.name}</p>
                </div>

                <div className="mb-5 flex gap-x-3 cursor-pointer max-md:cursor-auto"
                    onClick={() => handleUpdate({ description: user?.description })}>
                    <img src="assets/images/about.png" className='opacity-60 h-5' alt="" />
                    <p className='text-gray-200 text-sm'>{user?.description}</p>
                </div>

                <div className="mb-5 flex gap-x-3 cursor-pointer max-md:cursor-auto"
                    onClick={() => handleUpdate({ email: user?.email })}>
                    <img src="assets/images/email.png" className='opacity-60 h-5' alt="" />
                    <p className='text-gray-200 text-sm'>{user?.email}</p>
                </div>

                <div className="mb-5 flex gap-x-3 cursor-pointer max-md:cursor-auto" onClick={handleLogout}>
                    <img src="assets/images/logout.png" className='opacity-60 h-5 rotate-180' alt="" />
                    <p className='text-gray-200 text-sm'>logout</p>
                </div>
            </div>

            {
                isupdate && <InputPopup update={isupdate} setUpdate={setUpdate} setUser={setUser} />
            }
        </div>
    )
}

export default Profile