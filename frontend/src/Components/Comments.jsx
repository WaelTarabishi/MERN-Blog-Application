import { useEffect, useState } from 'react';
import { useGetuserMutation, useEditcommentMutation } from '../Slices/authApiSlice';
import moment from 'moment';
import { FaThumbsUp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Button, Textarea } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
const Comments = ({ comment, onLike, onEdit, onDelete }) => {
    const navigate = useNavigate()
    const [getuser, { isLoading, isSuccess }] = useGetuserMutation()
    const [user, setUser] = useState('')
    const { userInfo } = useSelector((state) => state.auth);
    const [editcomment] = useEditcommentMutation()
    const [isEditing, setIsEditing] = useState(false)
    const [editedContent, setEditedContent] = useState(comment.content)
    useEffect(() => {
        const fetchUser = async () => {
            const res = await getuser(comment.userId).unwrap()
            // console.log(res)
            setUser(res)
        }
        fetchUser()
    }, [comment])
    // console.log(comment._id)
    const handleEdit = () => {
        setIsEditing(true)
        setEditedContent(comment.content)
        // console.log(editedContent)

    }
    const handleSave = async () => {

        try {
            const res = await fetch(`/api/comment/editComment/${comment._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: editedContent,
                }),
            });
            if (res.ok) {
                setIsEditing(false);
                onEdit(comment, editedContent);
            }
        } catch (error) {
            console.log(error.message);
        }
    }
    const userProfileHandler = () => {
        navigate(`/user-profile/${user._id}`)
    }
    return (
        <>
            <div className=' w-full'>
                <div className='flex p-4 border-b dark:border-gray-600 text-sm '>
                    <div className='flex-shrink-0 mr-3'>
                        <Link onClick={userProfileHandler}>
                            <img
                                className='w-10 h-10 rounded-full bg-gray-0'
                                src={user.profilePicture}
                                alt={user.username}
                            />
                        </Link>
                    </div>
                    <div className='flex-1'>
                        <div className='flex items-center mb-1'>
                            <span className='font-bold mr-1 text-xs truncate'>
                                {comment.userId === "65eb0faf1ab4aee7b6e165aa" ? (<span className='text-green-500 bg-black rounded-md p-1 text-xs'>Admin</span>) : ("")}  {user ? `@${user.username}` : 'anonymous user'}
                            </span>
                            <span className='text-gray-500 text-xs'>
                                {moment(comment.createdAt).fromNow()}
                            </span>
                        </div>
                        {isEditing ? (
                            <>
                                <Textarea className='mb-2 '
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                />
                                <div className='flex flex-row gap-2 justify-end'>
                                    <Button type='button' color="success" size='sm' onClick={handleSave}  >Save</Button>
                                    <Button type="button" color="failure" size="sm" onClick={() => setIsEditing(false)} >Cancel</Button>
                                </div>
                            </>
                        )
                            :
                            (
                                <>
                                    <span className='text-gray-500 pb-2'>
                                        {comment.content}
                                    </span>
                                    <div className='flex flex-row items-center gap-2 justify-start mt-2'>
                                        <button className={`text-gray-400   ${userInfo && comment.likes.includes(userInfo._id) && "!text-blue-500"} `} onClick={() => { onLike(comment._id) }}  >
                                            <FaThumbsUp className='text-sm ' />
                                        </button>
                                        <p className='text-gray-400 pt'>
                                            {comment.numberOfLikes > 0 &&
                                                comment.numberOfLikes +
                                                ' ' +
                                                (comment.numberOfLikes === 1 ? 'Like' : 'Likes')}
                                        </p>

                                        {userInfo && (userInfo._id == comment.userId && ("Edit") || userInfo.isAdmin) && (
                                            <>
                                                <button type='button' className='text-gray-400 hover:text-blue-500' onClick={handleEdit}>
                                                    Edit
                                                </button>
                                                <button type='button' className='text-gray-400 hover:text-red-500' onClick={() => onDelete(comment._id)}>
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </>
                            )
                        }
                    </div>
                </div>
            </div >

        </>
    )
}

export default Comments