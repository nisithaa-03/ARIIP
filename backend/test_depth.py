from ai.depth_estimator import estimate_depth

depth = estimate_depth("uploads/0d9daa99-7d7e-489b-8716-ff41648f8241_Baughman-Magic-Seal-Asphalt-Cracks-1024x683.jpg")

print(depth.shape)
print(depth.min())
print(depth.max())
