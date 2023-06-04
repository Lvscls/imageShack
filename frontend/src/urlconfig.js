const getUrl = () => {
    if(window.location.href.includes("localhost")){
        return "http://localhost:8000"
    }
    return "http://vps-fb4cc13a.vps.ovh.net:8000"
}
export default getUrl