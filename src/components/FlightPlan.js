import React from 'react';
// import Header from "./Header";
import Select from "react-dropdown-select";

function FlightPlan() {
    let newDate = new Date();
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    let today = date.toString() + '/' + month.toString() + '/' + year.toString();
    const options = [
        {
            value: 1,
            label: today
        },
        {
            value: 2,
            label: 'Ervin Howell'
        }
    ];
    return (
        <div>
            {/* <Header /> */}
            <div>
                Date: <Select options={options} onChange={(values) => this.setValues(values)} />;

            </div>
        </div>
    )
}

export default FlightPlan;

