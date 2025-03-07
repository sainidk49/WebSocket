import React, { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider';

const UserList = () => {
    const navigate = useNavigate();
    const { baseUrl } = useAuth();
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);

    /////////// fetch all register users ////////////
    useEffect(() => {
        const getUsers = async () => {
            try {
                const res = await fetch(baseUrl + "/api/users", {
                    method: "POST"
                });
                const data = await res.json();

                if (data.status === true) {
                    const userData = data.users.filter(user => user._id !== localStorage.getItem("senderId"))
                    setUsers(userData);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError('Failed to fetch users.');
            } finally {
                setLoading(false);
            }
        };

        getUsers();
    }, [baseUrl]);

    /////////// start chat ////////////
    const handleUserClick = async (receiverId, receiverName, profilePicture, description) => {
        navigate('/chat', { state: { receiverId, receiverName, profilePicture, description } });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="blur-layer relative w-full h-full bg-cover bg-center text-white px-5">
            <div className="w-full flex gap-x-4 py-2 items-center border-b-1 border-b-gray-500">
                <div className="" onClick={() => navigate('/')}>
                    <img src="/assets/images/back.png" className='w-4' alt="" />
                </div>
                Users List
            </div>
            
            <div className="chat-list w-full py-5">
                {users && users.length > 0 ? (
                    users.map((user, index) => (
                        <div key={index}
                            className="chat-list-item w-full flex gap-x-4 pb-3 mb-5"
                            onClick={() => handleUserClick(user._id, user.name, user.profile, user.description)}>
                            <div className="user-img w-6 rounded-full overflow-hidden">
                                <img src={user.profile} alt="User" />
                            </div>
                            <p className='text-md capitalize'>
                                {user.name}
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No users found.</p>
                )}
            </div>
        </div>
    );
};

export default UserList;
