import React, { Component } from "react";
import styled from "styled-components";
import Head from "next/head";
import moment from "moment";
import FlightLogsSkeleton from "@Components/Skeletons/FlightLogsSkeleton";
import apiResponse from "./api.json";
import Airplane from "src/icons/Airplane";

export default class index extends Component {
    state = {
        flightLogs: null,
        isLoading: true,
    };

    componentDidMount() {
        fetch("/api/mwldata", {
            method: "POST",
            body: new URLSearchParams({
                query: "Logs",
            }),
        })
            .then((res) => res.json())
            .then((logs) =>
                this.setState({
                    isLoading: false,
                    flightLogs:
                        logs.result.Result === "OK"
                            ? logs.result.FlightLog
                            : "Error",
                })
            );
    }

    render() {
        this.state.flightLogs && console.log(this.state.flightLogs);
        return (
            <Container>
                {this.state.isLoading ? (
                    <FlightLogsSkeleton />
                ) : (
                    <FlightLogList>
                        {this.state.flightLogs.map((log, index) => {
                            let [day, month, year] = moment(log.flight_datum)
                                .format("D,MMM,YY")
                                .split(",");

                            return (
                                <FlightLog key={log.rowID}>
                                    <Date>
                                        <span className="day">{day}</span>
                                        <span className="monthyear">{`${month} ${year}`}</span>
                                    </Date>
                                    <Info>
                                        <Enroute>
                                            <span>
                                                {log.airborne_start.replace(
                                                    ":",
                                                    ""
                                                )}
                                            </span>
                                            <div className="enroute-spacer" />
                                            <span className="enroute-hrs">{`${
                                                Math.round(
                                                    parseFloat(
                                                        log.airborne_total
                                                    ) * 100
                                                ) / 100
                                            } hrs`}</span>
                                            <div className="enroute-spacer" />
                                            <span>
                                                {log.airborne_end.replace(
                                                    ":",
                                                    ""
                                                )}
                                            </span>
                                        </Enroute>
                                        <Airports>
                                            <span>{log.departure}</span>
                                            <span>{log.arrival}</span>
                                        </Airports>
                                        <FlightMeta>
                                            <span>
                                                <Airplane /> {log.regnr}
                                            </span>
                                            <span>{log.nature_beskr}</span>
                                        </FlightMeta>
                                    </Info>
                                    <Comment>{log.comment}</Comment>
                                </FlightLog>
                            );
                        })}
                    </FlightLogList>
                )}
            </Container>
        );
    }
}

const Container = styled.main`
    min-height: 100vh;
    width: 100%;
    font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue",
        sans-serif;
    background: #60a9ff;
    display: flex;
    justify-content: center;
`;

const FlightLogList = styled.ul`
    padding: 0;
    width: 400px;
`;

const FlightLog = styled.li`
    --content-color: black;
    list-style: none;
    display: grid;
    grid-template-columns: 90px 10px 1fr;
    grid-template-rows: 90px 1fr;
    grid-template-areas: "date spacer info" "comment comment comment";
    background: white;
    border-radius: 10px;
    padding: 10px;
    color: var(--content-color);
    transition: all 0.2s;
    cursor: pointer;

    &:not(:first-child) {
        margin-top: 15px;
    }

    &:hover {
        transform: scale(1.1);
    }
`;

const Date = styled.div`
    grid-area: date;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-bottom: 10px;
    font-weight: bold;

    .day {
        font-size: 3.2em;
        margin: 0;
    }

    .monthyear {
        font-size: 1.3em;
        margin: 0;
        opacity: 0.9;
    }
`;

const Info = styled.div`
    grid-area: info;
    display: flex;
    flex-direction: column;

    div {
        margin-top: 4px;
    }
`;

const Enroute = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    .enroute-spacer {
        height: 3px;
        width: 15%;
        background: var(--content-color);
    }

    .enroute-hrs {
        font-size: 0.75em;
    }

    span {
        font-weight: bold;
    }
`;

const Airports = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    span {
        font-size: 1.7em;
        font-weight: bold;
    }
`;

const FlightMeta = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .svg-container {
        width: 17px;
        margin-right: 6px;
        fill: var(--content-color);
    }

    span {
        display: flex;
        align-items: center;
    }
`;

const Comment = styled.div`
    grid-area: comment;
`;
