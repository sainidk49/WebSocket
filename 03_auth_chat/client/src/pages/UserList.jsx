import React, { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider';

const UserList = () => {
    const navigate = useNavigate();
    const { baseUrl } = useAuth();
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);


    useEffect(() => {
        const getUsers = async () => {
            try {
                const res = await fetch(baseUrl + "/api/users", {
                    method: "POST"
                });
                const data = await res.json();

                if (data.status === true) {
                    const userData = data.users.filter(user => user._id !== localStorage.getItem("senderId"))
                    console.log(localStorage.getItem("senderId"))
                    console.log(userData)
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

    const handleUserClick = async (receiverId, receiverName) => {
        navigate('/chat', { state: { receiverId, receiverName } });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="blur-layer relative w-full h-full bg-cover bg-center text-white px-5">
            <div className="chat-list w-full py-5">
                {users && users.length > 0 ? (
                    users.map((user, index) => (
                        <div key={index}
                            className="chat-list-item w-full flex gap-x-4 pb-3 mb-5"
                            onClick={() => handleUserClick(user._id, user.name)}>
                            <div className="user-img w-6 rounded-full overflow-hidden">
                                <img src="/assets/images/user-icon.jpg" alt="User" />
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
