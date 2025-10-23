"use server"

import { connectToDatabase } from "@/lib/mongodb"
import Faculty from "@/lib/models/Faculty"
import { revalidatePath } from "next/cache"

export async function deleteFaculty(facultyId: string) {
  try {
    await connectToDatabase()

    const deletedFaculty = await Faculty.findByIdAndDelete(facultyId)

    if (!deletedFaculty) {
      return {
        success: false,
        error: "Faculty member not found",
      }
    }

    // Revalidate the faculty page to reflect changes
    revalidatePath("/faculty")

    return {
      success: true,
      message: "Faculty member deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting faculty:", error)
    return {
      success: false,
      error: "Failed to delete faculty member",
    }
  }
}

export async function addFaculty(facultyData: any) {
  try {
    await connectToDatabase()

    const newFaculty = new Faculty({
      ...facultyData,
      createdAt: new Date(),
      updatedAt: new Date(),
      analytics: {
        profileViews: 0,
        contactClicks: 0,
        projectViews: 0,
        lastUpdated: new Date(),
      },
    })

    await newFaculty.save()

    // Revalidate the faculty page to reflect changes
    revalidatePath("/faculty")

    return {
      success: true,
      message: "Faculty member added successfully",
      faculty: newFaculty,
    }
  } catch (error) {
    console.error("Error adding faculty:", error)
    return {
      success: false,
      error: "Failed to add faculty member",
    }
  }
}

export async function updateFaculty(facultyId: string, facultyData: any) {
  try {
    await connectToDatabase()

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      facultyId,
      {
        ...facultyData,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!updatedFaculty) {
      return {
        success: false,
        error: "Faculty member not found",
      }
    }

    // Revalidate the faculty page to reflect changes
    revalidatePath("/faculty")

    return {
      success: true,
      message: "Faculty member updated successfully",
      faculty: updatedFaculty,
    }
  } catch (error) {
    console.error("Error updating faculty:", error)
    return {
      success: false,
      error: "Failed to update faculty member",
    }
  }
}

export async function getFacultyList() {
  try {
    await connectToDatabase()

    const facultyList = await Faculty.find({}).sort({ createdAt: -1 })

    return {
      success: true,
      faculty: JSON.parse(JSON.stringify(facultyList)),
    }
  } catch (error) {
    console.error("Error fetching faculty:", error)
    return {
      success: false,
      error: "Failed to fetch faculty list",
      faculty: [],
    }
  }
}

export async function getFacultyById(facultyId: string) {
  try {
    await connectToDatabase()

    const faculty = await Faculty.findById(facultyId)

    if (!faculty) {
      return {
        success: false,
        error: "Faculty member not found",
      }
    }

    // Increment profile views
    await Faculty.findByIdAndUpdate(facultyId, {
      $inc: { "analytics.profileViews": 1 },
      "analytics.lastUpdated": new Date(),
    })

    return {
      success: true,
      faculty: JSON.parse(JSON.stringify(faculty)),
    }
  } catch (error) {
    console.error("Error fetching faculty:", error)
    return {
      success: false,
      error: "Failed to fetch faculty member",
    }
  }
}
