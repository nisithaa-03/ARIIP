from ai.depth_estimator import estimate_depth

depth = estimate_depth(
    "uploads/b80ef7d0-25a7-47e1-82b9-771af9c72116_Baughman-Magic-Seal-Asphalt-Cracks-1024x683.jpg"
)

print(depth.shape)
print(depth.min())
print(depth.max())
