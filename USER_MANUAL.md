# User Manual

## Getting Started

### Creating an Account

1. Navigate to the registration page
2. Fill in the required information:
   - **Username**: Must be between 3-30 characters, unique
   - **Email**: Valid email address, unique
   - **Password**: Minimum 6 characters
3. Click "Register"
4. You will be automatically logged in and redirected to the dashboard

### Logging In

1. Navigate to the login page
2. Enter your email and password
3. Click "Login"
4. You will be redirected to your dashboard

## Dashboard

The dashboard is your home page where you can:
- View statistics about your projects
- See all projects you own or collaborate on
- Create new projects
- Access project details

### Dashboard Statistics

- **Owned Projects**: Number of projects you created
- **Shared Projects**: Number of projects shared with you
- **Total Versions**: Total number of versions across all projects
- **Total Collaborators**: Total number of collaborators across all projects

## Project Management

### Creating a Project

1. Click "Create New Project" button on the dashboard
2. Fill in project details:
   - **Project Name**: Required, max 100 characters
   - **Description**: Optional, max 500 characters
3. Click "Create Project"
4. You will be redirected to the project detail page

### Viewing Project Details

Click on any project card from the dashboard to view its details.

The project detail page has four tabs:

#### Overview Tab
- View and edit project name and description
- Only project owner and collaborators can access
- Click "Update Project" to save changes

#### Versions Tab
- **Create Version**: Add a new version to your project
  - Version Number: Required (e.g., "1.0.0")
  - Description: Optional
- **Version History**: View all versions created for the project
  - Shows version number, description, creator, and creation date

#### Documentation Tab
- View and edit project documentation
- Text-based documentation stored in the database
- Maximum 10,000 characters
- Click "Save Documentation" to update

#### Collaborators Tab
- **Add Collaborator** (Owner only):
  - Enter collaborator's email address
  - User must already have an account
  - Click "Add Collaborator"
- **View Collaborators**:
  - See project owner
  - See all collaborators
  - Remove collaborators (Owner only)

### Updating a Project

1. Navigate to the project detail page
2. Go to the "Overview" tab
3. Modify the project name or description
4. Click "Update Project"

### Deleting a Project

1. Navigate to the project detail page
2. Click the "Delete Project" button (Owner only)
3. Confirm the deletion
4. You will be redirected to the dashboard

## Collaboration

### Inviting Collaborators

1. Navigate to the project detail page
2. Go to the "Collaborators" tab
3. Enter the email address of the user you want to invite
4. Click "Add Collaborator"
5. The user must already have an account on the platform

**Note**: Only project owners can invite collaborators.

### Removing Collaborators

1. Navigate to the project detail page
2. Go to the "Collaborators" tab
3. Find the collaborator you want to remove
4. Click "Remove" next to their name
5. Confirm the removal

**Note**: Only project owners can remove collaborators. You cannot remove the project owner.

## Version Management

### Creating a Version

1. Navigate to the project detail page
2. Go to the "Versions" tab
3. Fill in the version form:
   - **Version Number**: Required (e.g., "1.0.0", "v2.1", "beta-1")
   - **Description**: Optional description of what changed
4. Click "Create Version"
5. The version will appear in the version history

### Viewing Version History

- All versions are listed in chronological order (newest first)
- Each version shows:
  - Version number
  - Description (if provided)
  - Creator username
  - Creation date

## Documentation

### Adding/Editing Documentation

1. Navigate to the project detail page
2. Go to the "Documentation" tab
3. Enter or edit your documentation in the text area
4. Click "Save Documentation" to save changes

**Note**: Documentation is stored as plain text. Maximum 10,000 characters.

## Roles and Permissions

### Project Owner
- Full access to all project features
- Can update project metadata
- Can delete the project
- Can invite and remove collaborators
- Can create versions
- Can edit documentation

### Collaborator
- Can view project details
- Can update project metadata
- Can create versions
- Can edit documentation
- Cannot delete the project
- Cannot invite or remove collaborators

## Logging Out

1. Click the "Logout" button in the navigation bar
2. You will be logged out and redirected to the login page
3. Your session token will be cleared

## Troubleshooting

### Cannot Login
- Verify your email and password are correct
- Ensure you have registered an account
- Try clearing your browser cache and cookies

### Cannot Access Project
- Verify you are the project owner or have been invited as a collaborator
- Check that you are logged in with the correct account
- Contact the project owner if you believe you should have access

### Cannot Add Collaborator
- Ensure the user has registered an account
- Verify you are the project owner
- Check that the email address is correct
- The user cannot already be a collaborator or owner

### Project Not Appearing
- Refresh the dashboard
- Verify you are logged in
- Check that the project wasn't deleted

## Best Practices

1. **Project Naming**: Use clear, descriptive project names
2. **Documentation**: Keep documentation up to date
3. **Versioning**: Use semantic versioning (e.g., 1.0.0, 1.1.0, 2.0.0)
4. **Collaboration**: Only invite trusted users as collaborators
5. **Security**: Keep your password secure and log out when done

## Support

For technical issues or questions:
- Check the setup documentation
- Review the architecture documentation
- Contact your system administrator
