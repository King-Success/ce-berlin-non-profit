'use strict';
let dateFormat = require('dateformat');
let now = Date();

class RhapsodyController {
    /**
     * @constructor
     *
     * @param rhapsodyService
     * @param logger
     */
    constructor(rhapsodyService, logger) {
        this.rhapsodyService = rhapsodyService;
        this.logger = logger;
    }

    /**
     * rhapsody index
     *
     * @param req
     * @param res
     */
    index(req, res, next) {
        let viewData = {
            menuActive: 'rhapsody'
        };
        // Get today's date for rhapsody fetching
        let today = dateFormat(now, "isoDate");
        //get date to with day for display in view
        let date = dateFormat(now, "fullDate");
        //Get rhapsody for today
        this.rhapsodyService.getRhapsodyByDate(today)
            .then(rhapsody => {
                viewData.date = date;
                viewData.rhapsody = rhapsody;
                res.render('show_rhapsody', viewData);
            })
            .catch( err => {
                req.flash('error', 'No Rhpasody was entered for today, kindly contact the admin');
                res.render('show_rhapsody', { viewData });
            });
    }

    /**
     * Form to add a new rhapsody into the database
     * 
     * @param req
     * @param res 
     */
    addNewView(req, res) {
        res.render('admin_add_rhapsody', { layout: 'admin_main' });
    }

    save(req, res, next) {
        let body = req.body;

        // Validate Form Input
        let error = this.rhapsodyService.validateRhapsodyData(req);
        if (error) {
            this.logger.error('Validation Error: ', error);
            let errorMessages = error.map(item => item.msg);
            req.flash('error', errorMessages);
            return res.render('admin_add_rhapsody', { layout: 'admin_main' });
        }

        this.rhapsodyService.createRhapsody(body)
            .then(() => {
                req.flash('success', 'saved successfully!')
                res.render('admin_add_rhapsody', { layout: 'admin_main' });
            })
            .catch((err) => {
                req.flash('error', 'saving failed!')
                res.render('admin_add_rhapsody', { layout: 'admin_main' });
            });
    }

    /**
    * rhapsody list
    *
    * @param req
    * @param res
    */
    list(req, res, next) {
        let viewData = {
            menuActive: 'rhapsody'
        };
        let params = {};
        if (req.query.page) {
            params.page = req.query.page;
        }

        this.rhapsodyService.listRhapsodies(params)
            .then(data => {
                viewData.rhapsodies = data.rhapsodies;
                viewData.pagination = data.pagination;
                res.render('admin_list_rhapsody', { viewData, layout: 'admin_main' });
            })
            .catch(() => {
                req.flash('error', 'There was an error retrieving rhapsodies, Please try again');
                res.render('admin_add_rhapsody', { viewData, layout: 'admin_main' });
            });
    }

    /**
    * rhapsody list
    *
    * @param req
    * @param res
    */
    editView(req, res, next) {
        let viewData = {
            menuActive: 'rhapsody'
        };
        let rhapsodyId = req.params.id;
        if (!rhapsodyId) {
            req.flash('error', 'No Rhapsody ID specified');
            res.redirect('/admin/list-rhapsody-realities');
        }
        this.rhapsodyService.getRhapsodyByID(rhapsodyId)
            .then(rhapsody => {
                viewData.rhapsody = rhapsody;
                res.render('admin_edit_rhapsody', { viewData, layout: 'admin_main' });
            })
            .catch(() => {
                req.flash('error', 'An unknown error has occurred, Please try again later');
                res.redirect('/admin/list-rhapsody-realities');
            });
    }

    /**
     * rhapsody update
     *
     * @param req
     * @param res
     */
    update(req, res, next) {
        let viewData = {
            menuActive: 'rhapsody'
        };
        let body = req.body;
        let rhapsodyId = req.params.id;
        // Validate form Input
        let error = this.rhapsodyService.validateRhapsodyData(req);
        if (error) {
            this.logger.error('Validation Error: ', error);
            let errorMessages = error.map(item => item.msg);
            viewData.rhapsody = body;
            viewData.rhapsody.id = rhapsodyId;
            req.flash('error', errorMessages);
            return res.render('admin_edit_rhapsody', { viewData, layout: 'admin_main' });
        }
        // attempt update
        this.rhapsodyService.update(body, rhapsodyId)
            .then(() => {
                res.redirect('/admin/list-rhapsody-realities');
            })
            .catch(err => {
                viewData.rhapsody = body;
                viewData.rhapsody.id = rhapsodyId;
                req.flash('error', 'An unknown error has occurred, Please try again');
                res.render('admin_edit_rhapsody', { viewData, layout: 'admin_main' });
            });
    }
}

module.exports = RhapsodyController;
