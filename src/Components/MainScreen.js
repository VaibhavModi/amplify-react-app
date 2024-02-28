import * as React from "react";
import mainmountain from '../images/minimalmountain.png'
import mainside from '../images/main-side.png'
import { Link } from "react-router-dom";

const styleButton = {
    backgroundImage: `url(${mainside})`, backgroundSize: 'cover', alignItems: 'center', justifyContent: 'center'
}

function MainScreen() {
    return (
        <div className="flex flex-col md:flex-row">
            <div className="hidden md:block w-full md:w-2/3 h-dvh mb-0 md:mb-0">
                <img
                    className="h-dvh w-full  object-cover object-bottom"
                    src={mainmountain}
                    alt="nature image"
                />
            </div>
            <div className="w-full flex flex-col md:w-1/3 h-dvh items-center" style={styleButton}>
            <h1 class="mb-20  font-extrabold text-gray-900 dark:text-white text-4xl md:text-4xl dark:text-white">Welcome!</h1>

                <div className="w-50 ">
                    <Link to="/home">
                        <button className="transition delay-150 duration-300 ease-in-out bg-indigo-700 text-white hover:bg-blue-400 font-bold py-2 px-4 mt-3 rounded-lg mb-2">GO TO HOMEPAGE</button>
                    </Link>
                </div>
                <div className="">
                    <Link to="/test">
                        <button className="transition delay-150 duration-300 ease-in-out bg-indigo-700 text-white hover:bg-blue-400 font-bold py-2 px-4 mt-3 rounded-lg mb-2">LOGIN</button>
                    </Link>
                </div>
            </div>

        </div>
    );
}


export default MainScreen;