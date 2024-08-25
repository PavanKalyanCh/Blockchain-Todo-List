// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TaskManager {
    struct Task {
        uint256 id;
        string description;
        bool completed;
    }

    uint256 public taskCount = 0;
    mapping(uint256 => Task) public tasks;

    event TaskCreated(uint256 id, string description, bool completed);
    event TaskCompleted(uint256 id, bool completed);
    event TaskDeleted(uint256 id);

    // Function to add a new task
    function addTask(string memory _description) public {
        taskCount++;
        tasks[taskCount] = Task(taskCount, _description, false);
        emit TaskCreated(taskCount, _description, false);
    }

    // Function to mark a task as completed
    function completeTask(uint256 _id) public {
        Task memory task = tasks[_id];
        require(task.id != 0, "Task does not exist");
        require(!task.completed, "Task is already completed");
        task.completed = true;
        tasks[_id] = task;
        emit TaskCompleted(_id, true);
    }

    // Function to delete a task
    function deleteTask(uint256 _id) public {
        Task memory task = tasks[_id];
        require(task.id != 0, "Task does not exist");
        delete tasks[_id];
        emit TaskDeleted(_id);
    }

    // Function to get task details by ID
    function getTask(uint256 _id) public view returns (uint256, string memory, bool) {
        Task memory task = tasks[_id];
        require(task.id != 0, "Task does not exist");
        return (task.id, task.description, task.completed);
    }
}
