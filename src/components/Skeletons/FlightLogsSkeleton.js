import React from "react";
import styled from "styled-components";
import Skeleton from "react-loading-skeleton";

const FlightLogsSkeleton = () => {
    return (
        <FlightLogList>
            {Array(9)
                .fill()
                .map((item, index) => (
                    <FlightLog key={index}>
                        <Skeleton height={100} />
                    </FlightLog>
                ))}
        </FlightLogList>
    );
};
export default FlightLogsSkeleton;

const FlightLog = styled.li`
    list-style: none;
`;

const FlightLogList = styled.ul`
    padding: 0;
`;
