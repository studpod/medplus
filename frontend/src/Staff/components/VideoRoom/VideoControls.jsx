import React from "react";

export default function VideoControls({
                                          mic,
                                          camera,
                                          toggleMic,
                                          toggleCamera,
                                          endCall
                                      }){

    return(

        <div className="controls">

            <div
                className="control-btn mic"
                onClick={toggleMic}
            >
                {mic ? "🎤" : "🔇"}
            </div>

            <div
                className="control-btn cam"
                onClick={toggleCamera}
            >
                {camera ? "📷" : "🚫"}
            </div>

            <div
                className="control-btn end"
                onClick={endCall}
            >
                📞
            </div>

        </div>

    )

}