exports.identify = (req, res) => {
    console.log('got request in controller');
    return res.status(200).send("hello world");
}