const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    suite('POST /api/issues/{project} => Issue Creation', function() {

        var issue = {
        issue_title: "Mocha Issue Creation Test",
        issue_text: "This is a test issue.",
        created_by: "Chai",
        assigned_to: "Chai",
        open: true,
        status_text: "In QA"}

      test('Create an issue with every field', function(done) {
        chai.request(server)
            .post('/api/issues/fcc-project')
            .send(issue)
            // .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
            if (err) done(err);
            assert.equal(res.status, 200);
                // res.body.should.have.property('issue_title');
                // res.body.should.have.property('nuid', '98ASDF988SDF89SDF89989SDF9898');
    
            // issue.forEach(element => {
            //     console.log(element + " = " + res.body.element)
            //     assert.equal(element, res.body.element);
            // })

            done();
            });
        });

      test('Create an issue with only required fields', function(done) {
        chai.request(server)
            .post('/api/issues/chai-test')
            .query({ input: '32g' })
            .end(function(err, res) {
        //     assert.equal(res.status, 200);
        //     assert.equal(res.body,'invalid unit')
        //   });
        // done();
            });
        });

      test('Create an issue with missing required fields', function(done) {
        chai.request(server)
            .post('/api/issues/chai-test')
            .query({ input: '3/7.2/4kg' })
            .end(function(err, res) {
        //     assert.equal(res.body, 'invalid number')
        //   });
        // done();
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
            // assert.equal(res.body.initNum, 10);
            // assert.equal(res.body.initUnit, 'L');
            // assert.approximately(res.body.returnNum, 2.64172, 0.1);
            // assert.equal(res.body.returnUnit, 'gal');
            done();
          });
      });

      test('View issues on a project with one filter', function(done) {
        chai.request(server)
            .get('/api/issues/fcc-project?open=false')
            .query({})
            .end(function(err, res) {
            assert.equal(res.status, 200);
        //     assert.equal(res.body,'invalid unit')
        //   });
            done();
            });
        });

      test('View issues on a project with multiple filters', function(done) {
        chai.request(server)
            .get('/api/issues/chai-test')
            .query({ input: '3/7.2/4kg' })
            .end(function(err, res) {
        //     assert.equal(res.body, 'invalid number')
        //   });
        // done();
            });
        });
    })

    suite('PUT /api/issues/{project} => Update an issue', function() {

      test('Update one field on an issue', function(done) {
        chai.request(server)
            .put('/api/issues/chai-test')
            .query({ input: '10L' })
            .end(function(err, res) {
            // assert.equal(res.status, 200);
            // assert.equal(res.body.initNum, 10);
            // assert.equal(res.body.initUnit, 'L');
            // assert.approximately(res.body.returnNum, 2.64172, 0.1);
            // assert.equal(res.body.returnUnit, 'gal');
            // done();
            });
        });

      test('Update multiple fields on an issue', function(done) {
        chai.request(server)
            .put('/api/issues/chai-test')
            .query({ input: '32g' })
            .end(function(err, res) {
        //     assert.equal(res.status, 200);
        //     assert.equal(res.body,'invalid unit')
        //   });
        // done();
            });
        });

      test('Update an issue with missing _id', function(done) {
        chai.request(server)
            .put('/api/issues/chai-test')
            .query({ input: '3/7.2/4kg' })
            .end(function(err, res) {
        //     assert.equal(res.body, 'invalid number')
        //   });
        // done();
            });
        });

      test('Update an issue with no fields to update', function(done) {
        chai.request(server)
            .put('/api/issues/chai-test')
            .query({ input: '3/7.2/4kg' })
            .end(function(err, res) {
        //     assert.equal(res.body, 'invalid number')
        //   });
        // done();
            });
        });

      test('Update an issue with an invalid _id', function(done) {
        chai.request(server)
            .put('/api/issues/chai-test')
            .query({ input: '3/7.2/4kg' })
            .end(function(err, res) {
        //     assert.equal(res.body, 'invalid number')
        //   });
        // done();
            });
        });
    })

    suite('DELETE /api/issues/{project} => Delete an Issue', function() {

      test('Delete an issue', function(done) {
        chai.request(server)
            .get('/api/convert')
            .query({ input: '10L' })
            .end(function(err, res) {
            // assert.equal(res.status, 200);
            // assert.equal(res.body.initNum, 10);
            // assert.equal(res.body.initUnit, 'L');
            // assert.approximately(res.body.returnNum, 2.64172, 0.1);
            // assert.equal(res.body.returnUnit, 'gal');
            // done();
            });
        });

      test('Delete an issue with an invalid _id', function(done) {
        chai.request(server)
            .get('/api/convert')
            .query({ input: '32g' })
            .end(function(err, res) {
        //     assert.equal(res.status, 200);
        //     assert.equal(res.body,'invalid unit')
        //   });
        // done();
            });
        });

      test('Delete an issue with missing _id', function(done) {
        chai.request(server)
            .delete('/api/convert')
            .query({ input: '3/7.2/4kg' })
            .end(function(err, res) {
        //     assert.equal(res.body, 'invalid number')
        //   });
        // done();
            });
        });
    })
});
