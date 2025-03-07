import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const ProfileImage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const profileImage = location.state?.profileImage || null

    useEffect(() => {
        if (!profileImage) {
            navigate("/")
        }
    }, [profileImage])

    return (
        <div className='blur-layer relative w-full h-full bg-cover bg-center text-white px-5'>
            <div className="w-full flex gap-x-4 py-2 items-center border-b-1 border-b-gray-500">
                <div className="" onClick={() => navigate('/profile')}>
                    <img src="/assets/images/back.png" className='w-4' alt="Back" />
                </div>
                Profile Image
            </div>
            <div className="mt-10 w-full">
                {profileImage ? (
                    <img src={profileImage} alt="Profile" />
                ) : (
                    <p>No profile image available</p> 
                )}
            </div>
        </div>
    )
}

export default ProfileImage
