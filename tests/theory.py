import matplotlib.pyplot as plt
import numpy as np

# Function to draw a square given its bottom left corner and size
def draw_square(ax, bottom_left, size, angle=0, color='green'):
    # Get rotation matrix
    rotation_matrix = np.array([[np.cos(angle), -np.sin(angle)],
                                [np.sin(angle), np.cos(angle)]])
    
    # Define the square's points
    square = np.array([[0, 0], [size, 0], [size, size], [0, size], [0, 0]])
    
    # Rotate and translate the square
    rotated_square = square @ rotation_matrix + bottom_left
    
    # Draw the square
    ax.plot(rotated_square[:, 0], rotated_square[:, 1], color=color)

# Recursive function to generate the Pythagoras Tree
def pythagoras_tree(ax, bottom_left, size, angle, depth, max_depth):
    if depth > max_depth:
        return
    
    # Draw current square
    draw_square(ax, bottom_left, size, angle)
    
    # Calculate the position and angle for the next squares
    next_size = size / np.sqrt(2)
    rotation_matrix = np.array([[np.cos(angle), -np.sin(angle)],
                                [np.sin(angle), np.cos(angle)]])
    top_left = bottom_left + np.array([0, size]) @ rotation_matrix
    
    left_angle = angle + np.pi / 4
    right_angle = angle - np.pi / 4
    
    # Draw left branch
    left_bottom_left = top_left
    pythagoras_tree(ax, left_bottom_left, next_size, left_angle, depth + 1, max_depth)
    
    # Draw right branch
    right_bottom_left = top_left + np.array([next_size * np.cos(left_angle), next_size * np.sin(left_angle)])
    pythagoras_tree(ax, right_bottom_left, next_size, right_angle, depth + 1, max_depth)

# Plot the Pythagoras Tree
def plot_pythagoras_tree():
    fig, ax = plt.subplots()
    ax.set_aspect('equal')
    
    # Parameters for the tree
    bottom_left = np.array([0, 0])
    size = 1
    angle = 0
    max_depth = 3
    
    # Draw the tree
    pythagoras_tree(ax, bottom_left, size, angle, 0, max_depth)
    
    # Display the plot
    plt.show()

plot_pythagoras_tree()
