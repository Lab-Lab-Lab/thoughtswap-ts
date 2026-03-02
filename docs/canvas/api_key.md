# Canvas API Key Scopes for ThoughtSwap

## Required Scopes

### Read:

* url:GET|/api/v1/users/:user_id/profile
    * Required to retrieve the authenticated user's profile information (specifically Name and Primary Email) to create a user account in ThoughtSwap.
* url:GET|/api/v1/users/:user_id/enrollments
    * Required to determine if a user is a Teacher or Student based on their active enrollments, and to verify they have authorized access to the system.
* url:GET|/api/v1/accounts/:account_id/terms
    * Needed to retrieve academic terms, allowing the application to identify current semesters and organize courses accordingly.
* url:GET|/api/v1/courses/:course_id/enrollments
    * Required to verify a user's specific enrollment in a course and to support retrieving course participants.
* url:GET|/api/v1/sections/:section_id/enrollments
    * Required to manage enrollments at the specific section level, ensuring users are mapped to the correct class time/group.
* url:GET|/api/v1/courses/:course_id/sections
    * Required to list the sections within a course, enabling the "separate class sections for professors" feature. 2 needed for course rosters
* url:GET|/api/v1/courses
    Required for the course list feature
* url:GET|/api/v1/courses/:course_id/users
    * To efficiently retrieve the Student Class Roster" for professors without iterating through individual enrollments.
* url:GET|/api/v1/courses/:course_id/assignments
    * Allows validating an assignment doesn't already exist before creating one, or for linking ThoughtSwap activities to existing Canvas assignments. 3 Nice to have not required
* url:GET|/api/v1/users/:user_id/avatars
    Allows ThoughtSwap to display the user's Canvas profile picture
* url:GET|/api/v1/courses/:course_id
    Provides general course metadata

## Write

Let's go for these in a future request?

* url:PUT|/api/v1/courses/:course_id/assignments/:id
    * Required to update assignment details (e.g., due dates, descriptions) for assignments managed by ThoughtSwap.
* url:PUT|/api/v1/courses/:course_id/assignments/
    * :assignment_id/submissions/:user_id Required for "Edit Points" functionality, enabling the application to pass grades/participation points back to the Canvas Gradebook for students. Without this editing grades would have to be manual
* url:POST|/api/v1/courses/:course_id/assignments
    * Required to allow professors to "Attach Assignments," creating new assignment entries in Canvas directly from the ThoughtSwap.
* url:POST|/api/v1/courses/:course_id/discussion topics
    * Would allow for ThoughtSwap discussions to be automatically synced to anonymous Canvas Discussion Boards archiving/access.


## Request Email

Good afternoon, Anthony and Eric. 

I would like to request an API key for Canvas. I wanted to first check if it would also be helpful for me to list API Keys that I'm aware of that you might be able to deactivate?

For the new key, 

**Contact:** Michael Stewart stewarmc@jmu.edu

**App Name:** ThoughtSwap

**App icon URL**: https://thoughtswap.org/assets/thoughtswap.png

**redirect URIs**:

* https://thoughtswap.org/accounts/canvas/login/callback/ 
* http://localhost:8000/accounts/canvas/login/callback/
* http://127.0.0.1:8000/accounts/canvas/login/callback/ 

## Scopes:

### Assignments:

* url:GET|/api/v1/courses/:course_id/assignments

### Courses:

* url:GET|/api/v1/courses
* url:GET|/api/v1/courses/:id
* url:GET|/api/v1/courses/:course_id/users

### Enrollments:

* url:GET|/api/v1/courses/:course_id/enrollments
* url:GET|/api/v1/sections/:section_id/enrollments
* url:GET|/api/v1/users/:user_id/enrollments


### Enrollment Terms:

* url:GET|/api/v1/accounts/:account_id/terms

### Sections:

* url:GET|/api/v1/courses/:course_id/sections

### Users:

* url:GET|/api/v1/users/:user_id/avatars
* url:GET|/api/v1/users/:user_id/profile
