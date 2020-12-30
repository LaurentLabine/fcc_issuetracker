const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

//Chai cheat sheet can be found here : https://devhints.io/chai

suite('Functional Tests', function() {

    var issue_id
    var invalid_id = "5fb83492487c29575564c4b9"
    var expect = chai.expect
    var resArray = []
    
    suite('POST /api/issues/{project} => Issue Creation', function() {

        var issue = {
        issue_title: "Chai Issue Creation Test 1",
        issue_text: "This is a test issue.",
        created_by: "bob",
        assigned_to: "Chai",
        open: true,
        status_text: "In QA"
    }

        var partialIssue = {
            issue_title: "Chai Issue Creation Test 2",
            issue_text: "Required Fields.",
            created_by: "Chai",
        }
    // More data here : https://stackoverflow.com/questions/31594844/chai-should-have-property-supertest
      test('Create an issue with every field', function(done) {
        chai.request(server)
            .post('/api/issues/fcc-project')
            .send(issue)
            .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
            assert.equal(typeof res.body._id, "string")//ID
            issue_id = res.body._id
            assert.equal(res.body.issue_title, issue.issue_title)//Issue_title
            assert.equal(res.body.issue_text, issue.issue_text)//Issue_text
            assert.equal(res.body.created_by, issue.created_by)//Created_by
            assert.equal(res.body.assigned_to, issue.assigned_to)//Assigned_to
            assert.equal(res.body.open, issue.open)//Issue_Open
            assert.equal(res.body.status_text, issue.status_text)//Status_text
            assert.closeTo(new Date().valueOf(),new Date(res.body.created_on).valueOf(),1000);//Created_On
            assert.equal(new Date(res.body.created_on).valueOf(),new Date(res.body.updated_on).valueOf());//Updated_On
            done();
            });
        });

      test('Create an issue with only required fields', function(done) {
        chai.request(server)
        .post('/api/issues/fcc-project')
        .send({issue_title: issue.issue_title, issue_text: issue.issue_text, created_by: issue.created_by })
        .end((err, res) => {
        if (err) done(err);
        assert.equal(res.status, 200);
        assert.equal(typeof res.body._id, "string")
        assert.equal(res.body.issue_title, issue.issue_title)
        assert.equal(res.body.issue_text, issue.issue_text)
        assert.equal(res.body.created_by, issue.created_by)
        assert.equal(res.body.assigned_to, "")
        assert.equal(res.body.open, true)
        assert.equal(res.body.status_text, "")
        assert.closeTo(new Date().valueOf(),new Date(res.body.created_on).valueOf(),2000);
        assert.equal(new Date(res.body.created_on).valueOf(),new Date(res.body.updated_on).valueOf());
        done();
            });
        });

      test('Create an issue with missing required fields', function(done) {
        chai.request(server)
            .post('/api/issues/fcc-project')
            .send({issue_title: issue.issue_title})
            .end((err, res) => {
            if (err) done(err);
                assert.equal(res.status, 200);
                assert.equal(res.body.error,"required field(s) missing")
                done();
            });
        });
    })

    suite('GET /api/issues/{project} => View Issues', function() {

      test('View issues on a project', function(done) {
        chai.request(server)
            .get('/api/issues/fcc-project')
            .query({})
            .end(function(err, res) {
            assert.equal(res.status, 200);
            resArray = res.body
            resArray.forEach(element => {
                expect(element).to.have.property("updated_on");
                expect(element).to.have.property("assigned_to");
                expect(element).to.have.property("open");
                expect(element).to.have.property("status_text");
                expect(element).to.have.property("_id");
                expect(element).to.have.property("issue_title");
                expect(element).to.have.property("issue_text");
                expect(element).to.have.property("created_by");
                expect(element).to.have.property("created_on");
            });
            done();
          });
      });

      test('View issues on a project with one filter', function(done) {
        chai.request(server)
            .get('/api/issues/fcc-project?open=false')
            .end(function(err, res) {
            assert.equal(res.status, 200);
            resArray = res.body
            resArray.forEach(element => {
                expect(element).to.have.property("updated_on");
                expect(element).to.have.property("assigned_to");
                expect(element).to.have.property("open");
                expect(element).to.have.property("status_text");
                expect(element).to.have.property("_id");
                expect(element).to.have.property("issue_title");
                expect(element).to.have.property("issue_text");
                expect(element).to.have.property("created_by");
                expect(element).to.have.property("created_on");
                assert.equal(element.open,false)
            });
            done();
            });
        });

      test('View issues on a project with multiple filters', function(done) {
        chai.request(server)
            .get('/api/issues/fcc-project?open=true?created_by="bob"')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                resArray = res.body
                resArray.forEach(element => {
                    expect(element).to.have.property("updated_on");
                    expect(element).to.have.property("assigned_to");
                    expect(element).to.have.property("open");
                    expect(element).to.have.property("status_text");
                    expect(element).to.have.property("_id");
                    expect(element).to.have.property("issue_title");
                    expect(element).to.have.property("issue_text");
                    expect(element).to.have.property("created_by");
                    expect(element).to.have.property("created_on");
                    assert.equal(element.open,false)
                    assert.equal(element.created_by,"bob")
                });
                done();
            });
        });
    })

    suite('PUT /api/issues/{project} => Update an issue', function() {

      test('Update one field on an issue', function(done) {
        chai.request(server)
            .put('/api/issues/fcc-project')
            .send({_id: issue_id, issue_title:"chai put test issue"})
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.body.result, "successfully updated");
                assert.equal(res.body._id, issue_id);
                done();
            });
        });

      test('Update multiple fields on an issue', function(done) {
        chai.request(server)
        .put('/api/issues/fcc-project')
        .send({_id: issue_id, issue_title:"chai put test issue", issue_text:"Modified by Chai Testing", created_by: "Chai Testing"})
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, issue_id);
            done();
            });
        });

      test('Update an issue with missing _id', function(done) {
        chai.request(server)
        .put('/api/issues/fcc-project')
        .send({issue_title:"chai put test issue"})
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error,"missing _id");
            done();
            });
        });

      test('Update an issue with no fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/fcc-project')
        .send({_id: issue_id})
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "no update field(s) sent");
            assert.equal(res.body._id, issue_id);
            done();
            });
        });

      test('Update an issue with an invalid _id', function(done) {
        chai.request(server)
        .put('/api/issues/fcc-project')
        .send({_id: invalid_id, issue_title:"chai put test issue"})
        .end(function(err, res) {
            assert.equal(res.body.error, "could not update");
            assert.equal(res.body._id, invalid_id);
            done();
            });
        });
    })

    suite('DELETE /api/issues/{project} => Delete an Issue', function() {

      test('Delete an issue', function(done) {
        chai.request(server)
            .del('/api/issues/fcc-project')
            .send({_id:issue_id})
            .end(function(err, res) {
               assert.equal(res.status, 200);
               assert.equal(res.body.result, "successfully deleted")
               assert.equal(res.body._id, issue_id)
            done();
            });
        });

      test('Delete an issue with an invalid _id', function(done) {
        chai.request(server)
        .del('/api/issues/fcc-project')
        .send({_id:"5f133661ef664d011fd5b9ed"})
        .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "could not delete")
            done();
            });
        });

      test('Delete an issue with missing _id', function(done) {
        chai.request(server)
            .del('/api/issues/fcc-project')
            .send({})
            .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "missing _id")
            done();
            });
        });
    })
});
