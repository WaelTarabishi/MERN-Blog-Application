import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { DashProfile, DashSidebar, DashPosts, DashUsers, DashComments, Dash } from '../Components';


const Dashborad = () => {
    const location = useLocation()
    const [tab, setTab] = useState('')

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        const tabFromUrl = urlParams.get('tab')
        tabFromUrl && setTab(tabFromUrl)

    }, [location.search])
    return (
        <div className='min-h-screen flex flex-col md:flex-row'>
            <div className='md:w-56'>
                {/* SideBar */}
                <DashSidebar />
            </div>
            {/* Profiel */}

            {tab === 'profile' && <DashProfile />}
            {tab === "posts" && <DashPosts />}
            {tab === "users" && <DashUsers />}
            {tab === "comments" && <DashComments />}
            {tab === "dash" && <Dash />}
        </div>
    )
}

export default Dashborad