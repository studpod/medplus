import React from "react";
import styles from "./VideoCall.module.scss";

import {
    FaMicrophone,
    FaMicrophoneSlash,
    FaVideo,
    FaVideoSlash,
    FaPhone
} from "react-icons/fa";

export default function VideoControls({
                                          mic,
                                          camera,
                                          toggleMic,
                                          toggleCamera,
                                          endCall
                                      }) {
    return (
        <div className={styles.controls}>

            <div className={styles.btn} onClick={toggleMic}>
                {mic ? <FaMicrophone /> : <FaMicrophoneSlash />}
            </div>

            <div className={styles.btn} onClick={toggleCamera}>
                {camera ? <FaVideo /> : <FaVideoSlash />}
            </div>

            <div className={`${styles.btn} ${styles.end}`} onClick={endCall}>
                <FaPhone />
            </div>

        </div>
    );
}