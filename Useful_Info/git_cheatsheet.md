### Clone (ssh, https)
    git clone git@github.com:unsw-cse-comp3900-9900-22T2/capstone-project-9900-t16p-ahduiduidui.git (need ssh key)
    git clone https://github.com/unsw-cse-comp3900-9900-22T2/capstone-project-9900-t16p-ahduiduidui.git (optional)
### Create your own branch (need to change your_branch_name)
    git checkout -b your_branch_name (create your own branch on your local repo)
    git push --set-upstream origin your_branch_name (set your local branch to remote repo)
### Merge main branch code to your branch (The premise is that your code progress lags behind the main branch progress)
    git checkout main
    git pull
    git checkout your_branch_name
    git merge main
### Change your shown name when you want to commit
    git config --global user.name "your name"
### Update your code to your branch (change update_directory)
    git checkout your_branch_name
    git add update_directory
    git commit -m "update"
    git push
### Update your code to main branch (better use pull requests if you are not maintainer)

### Update your work dairy
    git checkout main
    git pull
    cd Work_Diary
    git add .
    git commit -m "update my work dairy of week x"
    git push
    
