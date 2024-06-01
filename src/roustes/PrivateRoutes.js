import { useEffect } from "react";
import { Route } from "react-router-dom";

const PrivateRoutes = (props) => {
    useEffect(() => {

    }, []);
    return (<>
        <Route path={props.path} element={props.element} />
    </>)
}

export default PrivateRoutes;